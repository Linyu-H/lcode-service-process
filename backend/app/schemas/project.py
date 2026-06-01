from __future__ import annotations
from pydantic import BaseModel
from app.schemas.common import ORMModel

class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    project_type: str = "software"
    local_path: str
    git_url: str | None = None
    default_workflow_id: str | None = None
    default_model_id: str | None = None
    status: str = "active"
    last_run_status: str | None = None

class ProjectCreate(ProjectBase): pass
class ProjectUpdate(ProjectBase): pass
class ProjectOut(ProjectBase, ORMModel):
    id: str
