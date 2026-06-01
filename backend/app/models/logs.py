from __future__ import annotations
from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import IdTimestampMixin

class OperationLog(IdTimestampMixin, Base):
    __tablename__ = "operation_logs"
    actor: Mapped[str] = mapped_column(String(80), default="local_user")
    action: Mapped[str] = mapped_column(String(120), index=True)
    resource_type: Mapped[str] = mapped_column(String(80), index=True)
    resource_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(40), default="low")
    allowed: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

class AIRequestLog(IdTimestampMixin, Base):
    __tablename__ = "ai_request_logs"
    provider_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    model_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    workflow_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    node_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    prompt_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    token_usage_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

class CommandLog(IdTimestampMixin, Base):
    __tablename__ = "command_logs"
    workflow_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    node_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    command: Mapped[str] = mapped_column(Text)
    cwd: Mapped[str | None] = mapped_column(String(800), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    exit_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(40), default="low")
    blocked_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

class FileChange(IdTimestampMixin, Base):
    __tablename__ = "file_changes"
    workflow_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    node_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    path: Mapped[str] = mapped_column(String(1000), index=True)
    operation: Mapped[str] = mapped_column(String(40), index=True)
    before_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    after_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
