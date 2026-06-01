from __future__ import annotations
from typing import Any
from pydantic import BaseModel
from app.schemas.common import ORMModel

class WorkflowBase(BaseModel):
    project_id: str | None = None
    name: str
    description: str | None = None
    version: int = 1
    graph_json: str = '{"nodes":[],"edges":[]}'
    status: str = "draft"
    is_template: bool = False

class WorkflowCreate(WorkflowBase): pass
class WorkflowUpdate(WorkflowBase): pass
class WorkflowOut(WorkflowBase, ORMModel):
    id: str

class NodeTemplateBase(BaseModel):
    node_type: str
    name: str
    category: str = "system"
    description: str | None = None
    schema_json: str | None = None
    default_config_json: str | None = None
    executable: bool = False

class NodeTemplateCreate(NodeTemplateBase): pass
class NodeTemplateOut(NodeTemplateBase, ORMModel):
    id: str

class ValidationResult(BaseModel):
    valid: bool
    errors: list[str] = []
    warnings: list[str] = []

class ImportWorkflowRequest(BaseModel):
    payload: dict[str, Any]
