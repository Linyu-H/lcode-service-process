from __future__ import annotations
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import IdTimestampMixin

class Workflow(IdTimestampMixin, Base):
    __tablename__ = "workflows"
    project_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("projects.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    graph_json: Mapped[str] = mapped_column(Text, default='{"nodes":[],"edges":[]}')
    status: Mapped[str] = mapped_column(String(40), default="draft", index=True)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)

class WorkflowNode(IdTimestampMixin, Base):
    __tablename__ = "workflow_nodes"
    workflow_id: Mapped[str] = mapped_column(String(36), ForeignKey("workflows.id"), index=True)
    node_key: Mapped[str] = mapped_column(String(120), index=True)
    node_type: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    position_x: Mapped[int] = mapped_column(Integer, default=0)
    position_y: Mapped[int] = mapped_column(Integer, default=0)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    execution_mode: Mapped[str] = mapped_column(String(40), default="auto")
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=120)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    failure_strategy: Mapped[str] = mapped_column(String(40), default="fail")
    require_confirmation: Mapped[bool] = mapped_column(Boolean, default=False)
    risk_level: Mapped[str] = mapped_column(String(40), default="low")

class WorkflowEdge(IdTimestampMixin, Base):
    __tablename__ = "workflow_edges"
    workflow_id: Mapped[str] = mapped_column(String(36), ForeignKey("workflows.id"), index=True)
    source_node_key: Mapped[str] = mapped_column(String(120), index=True)
    target_node_key: Mapped[str] = mapped_column(String(120), index=True)
    label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    condition_json: Mapped[str | None] = mapped_column(Text, nullable=True)

class NodeTemplate(IdTimestampMixin, Base):
    __tablename__ = "node_templates"
    node_type: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(80), default="system", index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    executable: Mapped[bool] = mapped_column(Boolean, default=False)
