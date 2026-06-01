from __future__ import annotations
from app.nodes.base import BaseNode, NodeContext, NodeResult
from app.models.run import ConfirmRequest
class ManualConfirmNode(BaseNode):
    node_type = "manual_confirm"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        req = ConfirmRequest(workflow_run_id=ctx.workflow_run_id, node_run_id=ctx.node_run_id, title=ctx.config.get("title", "需要人工确认"), message=ctx.config.get("message"), risk_level=ctx.config.get("risk_level", "medium"))
        ctx.db.add(req); ctx.db.commit(); ctx.db.refresh(req)
        return NodeResult(False, {"confirm_request_id": req.id}, "流程已暂停，等待人工确认")
