from __future__ import annotations
from app.nodes.base import BaseNode, NodeContext, NodeResult
class EndNode(BaseNode):
    node_type = "end"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        return NodeResult(True, {"completed": True, "summary": ctx.upstream})
