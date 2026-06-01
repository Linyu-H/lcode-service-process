from __future__ import annotations
from sqlalchemy.orm import Session
from app.core.encryption import encryption_service
from app.models.ai import AIModel, AIProvider
from app.services.ai.openai_compatible import OpenAICompatibleClient

class AIManager:
    def get_client_for_model(self, db: Session, model_id: str | None) -> tuple[OpenAICompatibleClient, AIModel]:
        model = db.get(AIModel, model_id) if model_id else db.query(AIModel).filter(AIModel.is_default == True, AIModel.is_active == True).first()
        if not model:
            raise RuntimeError("未配置可用 AI 模型")
        provider = db.get(AIProvider, model.provider_id) if model.provider_id else None
        if not provider:
            raise RuntimeError("模型未绑定 AI Provider")
        key = encryption_service.decrypt(provider.api_key_encrypted)
        base_url = provider.base_url or "https://api.openai.com/v1"
        return OpenAICompatibleClient(base_url, key, provider.timeout_seconds), model

ai_manager = AIManager()
