from __future__ import annotations
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import IdTimestampMixin

class Project(IdTimestampMixin, Base):
    __tablename__ = "projects"
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project_type: Mapped[str] = mapped_column(String(80), default="software")
    local_path: Mapped[str] = mapped_column(String(800))
    git_url: Mapped[str | None] = mapped_column(String(800), nullable=True)
    default_workflow_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    default_model_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(40), default="active", index=True)
    last_run_status: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
