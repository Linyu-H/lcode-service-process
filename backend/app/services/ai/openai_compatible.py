from __future__ import annotations
import httpx
from app.services.ai.base import AIClient, AIRequest, AIResponse

class OpenAICompatibleClient(AIClient):
    def __init__(self, base_url: str, api_key: str | None, timeout: int = 60) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    async def complete(self, request: AIRequest) -> AIResponse:
        if not self.api_key:
            raise RuntimeError("API Key 未配置，请先在 AI 模型配置中设置服务商 Key。")
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"model": request.model, "messages": [m.model_dump() for m in request.messages], "temperature": request.temperature, "max_tokens": request.max_tokens}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return AIResponse(content=content, raw=data)
