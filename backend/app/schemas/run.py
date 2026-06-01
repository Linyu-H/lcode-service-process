from __future__ import annotations
from pydantic import BaseModel
from app.schemas.common import ORMModel

class WorkflowRunOut(ORMModel):
    id: str
    workflow_id: str
    project_id: str | None
    status: str
    current_node_key: str | None
    progress: int
    error_message: str | None

class RunCreate(BaseModel):
    input_json: str | None = None

class NodeRunOut(ORMModel):
    id: str
    workflow_run_id: str
    node_key: str
    node_type: str
    status: str
    output_json: str | None
    error_message: str | None

class ConfirmAction(BaseModel):
    comment: str | None = None
    payload: dict | None = None
