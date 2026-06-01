from __future__ import annotations
from app.nodes.base import BaseNode, NodeContext, NodeResult
from app.services.ai.base import AIRequest, ChatMessage
from app.services.ai.manager import ai_manager
class AITaskNode(BaseNode):
    node_type = "ai_task"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        system = ctx.config.get("system_prompt", "你是企业级软件工程助手。")
        prompt = ctx.config.get("user_prompt") or ctx.config.get("prompt")
        if not prompt:
            return NodeResult(False, {}, "AI 节点缺少 user_prompt")
        try:
            client, model = ai_manager.get_client_for_model(ctx.db, ctx.model_id)
            resp = await client.complete(AIRequest(model=model.name, messages=[ChatMessage(role="system", content=system), ChatMessage(role="user", content=prompt)], temperature=model.temperature, max_tokens=model.max_output_tokens))
            return NodeResult(True, {"content": resp.content})
        except Exception as exc:
            return NodeResult(False, {}, str(exc))
