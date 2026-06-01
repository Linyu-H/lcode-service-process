from __future__ import annotations
from pydantic import BaseModel
from app.schemas.common import ORMModel

class AIProviderBase(BaseModel):
    name: str
    provider_type: str = "custom_openai_compatible"
    base_url: str | None = None
    api_key: str | None = None
    default_headers_json: str | None = None
    proxy_url: str | None = None
    timeout_seconds: int = 60
    retry_count: int = 2
    stream_enabled: bool = True
    is_active: bool = True

class AIProviderCreate(AIProviderBase): pass
class AIProviderUpdate(AIProviderBase): pass

class AIProviderOut(ORMModel):
    id: str
    name: str
    provider_type: str
    base_url: str | None
    api_key_masked: str | None
    default_headers_json: str | None
    proxy_url: str | None
    timeout_seconds: int
    retry_count: int
    stream_enabled: bool
    is_active: bool

class AIModelBase(BaseModel):
    provider_id: str | None = None
    name: str
    display_name: str
    role: str = "custom"
    max_context_tokens: int = 128000
    max_output_tokens: int = 4096
    temperature: float = 0.2
    top_p: float = 1.0
    default_system_prompt: str | None = None
    is_default: bool = False
    is_active: bool = True

class AIModelCreate(AIModelBase): pass
class AIModelUpdate(AIModelBase): pass
class AIModelOut(AIModelBase, ORMModel):
    id: str
