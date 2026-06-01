from __future__ import annotations
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class AIRequest(BaseModel):
    messages: list[ChatMessage]
    model: str
    temperature: float = 0.2
    max_tokens: int = 4096

class AIResponse(BaseModel):
    content: str
    raw: dict | None = None

class AIStreamChunk(BaseModel):
    content_delta: str
    done: bool = False

class AIClient:
    async def complete(self, request: AIRequest) -> AIResponse:
        raise NotImplementedError
