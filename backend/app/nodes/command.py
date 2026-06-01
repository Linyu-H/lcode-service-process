from __future__ import annotations
from app.nodes.base import BaseNode, NodeContext, NodeResult
from app.services.command_runner import command_runner
class CommandNode(BaseNode):
    node_type = "command"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        command = ctx.config.get("command")
        cwd = ctx.config.get("cwd")
        if not command:
            return NodeResult(False, {}, "命令节点缺少 command")
        log = await command_runner.run(ctx.db, command, cwd=cwd, timeout=int(ctx.config.get("timeout_seconds", 120)), workflow_run_id=ctx.workflow_run_id, node_run_id=ctx.node_run_id)
        return NodeResult(log.status == "success", {"command_log_id": log.id, "status": log.status, "exit_code": log.exit_code, "output": log.output}, log.blocked_reason or (None if log.status == "success" else log.output))
