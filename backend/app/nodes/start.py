from __future__ import annotations
from app.nodes.base import BaseNode, NodeContext, NodeResult
class StartNode(BaseNode):
    node_type = "start"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        return NodeResult(True, {"started": True, "config": ctx.config})
