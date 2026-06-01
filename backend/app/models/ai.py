from __future__ import annotations
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import IdTimestampMixin

class AIProvider(IdTimestampMixin, Base):
    __tablename__ = "ai_providers"
    name: Mapped[str] = mapped_column(String(120), index=True)
    provider_type: Mapped[str] = mapped_column(String(60), default="custom_openai_compatible")
    base_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    api_key_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    api_key_masked: Mapped[str | None] = mapped_column(String(120), nullable=True)
    default_headers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    proxy_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=60)
    retry_count: Mapped[int] = mapped_column(Integer, default=2)
    stream_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

class AIModel(IdTimestampMixin, Base):
    __tablename__ = "ai_models"
    provider_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("ai_providers.id"), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(160))
    display_name: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(60), default="custom", index=True)
    max_context_tokens: Mapped[int] = mapped_column(Integer, default=128000)
    max_output_tokens: Mapped[int] = mapped_column(Integer, default=4096)
    temperature: Mapped[float] = mapped_column(Float, default=0.2)
    top_p: Mapped[float] = mapped_column(Float, default=1.0)
    default_system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
