from __future__ import annotations
import asyncio
from collections import deque
from app.models.workflow import Workflow
from app.models.run import WorkflowRun, NodeRun
from app.services.node_registry import node_registry
from app.nodes.base import NodeContext
from app.utils.json import loads, dumps
from app.utils.time import utc_now
from app.services.websocket_manager import ws_manager

RESERVED_NODE_MESSAGE = "该节点当前为企业预留模板，暂未接入执行器。请先使用开始、AI任务、命令、人工确认、结束节点完成可运行流程。"


class WorkflowEngine:
    def validate_graph(self, graph: dict) -> tuple[list[str], list[str]]:
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        errors, warnings = [], []
        if not nodes:
            return ["流程不能为空：请至少添加开始节点和结束节点"], []

        types = [n.get("type") or n.get("data", {}).get("node_type") for n in nodes]
        ids = [n.get("id") for n in nodes]
        id_set = set(ids)
        if "start" not in types:
            errors.append("必须存在开始节点")
        if "end" not in types:
            errors.append("必须存在结束节点")
        if len(ids) != len(id_set):
            errors.append("节点 ID 不能重复")
        if len(nodes) > 1 and not edges:
            warnings.append("当前流程没有连线，运行时只能执行起始节点")

        for edge in edges:
            if edge.get("source") not in id_set:
                errors.append(f"连线源节点不存在：{edge.get('source')}")
            if edge.get("target") not in id_set:
                errors.append(f"连线目标节点不存在：{edge.get('target')}")

        outgoing: dict[str, list[str]] = {}
        for edge in edges:
            outgoing.setdefault(edge.get("source"), []).append(edge.get("target"))

        start = next((n for n in nodes if (n.get("type") or n.get("data", {}).get("node_type")) == "start"), None)
        reachable = set()
        if start:
            queue = deque([start.get("id")])
            while queue:
                current = queue.popleft()
                if current in reachable:
                    continue
                reachable.add(current)
                queue.extend(outgoing.get(current, []))
            for node in nodes:
                if node.get("id") not in reachable:
                    warnings.append(f"节点 {node.get('id')} 不能从开始节点到达")
            end_nodes = [n for n in nodes if (n.get("type") or n.get("data", {}).get("node_type")) == "end"]
            if end_nodes and not any(n.get("id") in reachable for n in end_nodes):
                errors.append("结束节点不可达：请从开始节点连线到结束节点")

        for node in nodes:
            node_type = node.get("type") or node.get("data", {}).get("node_type")
            if not node_registry.get(node_type):
                warnings.append(f"节点 {node.get('id')}（{node_type}）当前为预留模板，运行时会失败：{RESERVED_NODE_MESSAGE}")
        return errors, warnings

    async def run_workflow(self, db, workflow_id: str, input_json: str | None = None) -> WorkflowRun:
        wf = db.get(Workflow, workflow_id)
        if not wf:
            raise RuntimeError("工作流不存在")
        graph = loads(wf.graph_json, {"nodes": [], "edges": []})
        errors, _ = self.validate_graph(graph)
        run = WorkflowRun(workflow_id=workflow_id, project_id=wf.project_id, status="running", started_at=utc_now(), input_json=input_json)
        if errors:
            run.status = "failed"
            run.error_message = "; ".join(errors)
            db.add(run)
            db.commit()
            db.refresh(run)
            return run
        db.add(run)
        db.commit()
        db.refresh(run)
        asyncio.create_task(self._execute(db, run.id, graph))
        return run

    async def _execute(self, db, run_id: str, graph: dict):
        run = db.get(WorkflowRun, run_id)
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        by_id = {n.get("id"): n for n in nodes}
        outgoing = {}
        for e in edges:
            outgoing.setdefault(e.get("source"), []).append(e.get("target"))
        start = next((n for n in nodes if (n.get("type") or n.get("data", {}).get("node_type")) == "start"), nodes[0] if nodes else None)
        current = start.get("id") if start else None
        completed = 0
        upstream = {}
        while current:
            n = by_id[current]
            ntype = n.get("type") or n.get("data", {}).get("node_type")
            impl = node_registry.get(ntype)
            nr = NodeRun(workflow_run_id=run_id, node_key=current, node_type=ntype, status="running", started_at=utc_now(), input_json=dumps(upstream))
            db.add(nr)
            db.commit()
            db.refresh(nr)
            run.current_node_key = current
            db.add(run)
            db.commit()
            await ws_manager.broadcast({"type": "node.started", "run_id": run_id, "node": current, "node_type": ntype}, run_id)
            if not impl:
                result_success, output, error = False, {}, RESERVED_NODE_MESSAGE
            else:
                res = await impl.execute(NodeContext(db=db, workflow_run_id=run_id, node_run_id=nr.id, config=n.get("data", {}).get("config", {}), upstream=upstream, model_id=n.get("data", {}).get("model_id")))
                result_success, output, error = res.success, res.output, res.error
            nr.status = "success" if result_success else ("waiting_confirm" if ntype == "manual_confirm" else "failed")
            nr.output_json = dumps(output)
            nr.error_message = error
            nr.ended_at = utc_now()
            db.add(nr)
            upstream[current] = output
            completed += 1
            run.progress = int(completed / max(len(nodes), 1) * 100)
            await ws_manager.broadcast({"type": "node.completed" if result_success else "node.failed", "run_id": run_id, "node": current, "node_type": ntype, "output": output, "error": error}, run_id)
            if not result_success:
                run.status = "waiting_confirm" if ntype == "manual_confirm" else "failed"
                run.error_message = error
                run.ended_at = utc_now()
                db.add(run)
                db.commit()
                return
            nxt = outgoing.get(current, [])
            current = nxt[0] if nxt else None
        run.status = "success"
        run.progress = 100
        run.output_json = dumps(upstream)
        run.ended_at = utc_now()
        db.add(run)
        db.commit()
        await ws_manager.broadcast({"type": "workflow.completed", "run_id": run_id}, run_id)


workflow_engine = WorkflowEngine()
