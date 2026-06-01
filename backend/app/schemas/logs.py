from __future__ import annotations
from app.schemas.common import ORMModel

class OperationLogOut(ORMModel):
    id: str
    action: str
    resource_type: str
    resource_id: str | None
    summary: str | None
    risk_level: str
    allowed: bool
    error_message: str | None

class CommandLogOut(ORMModel):
    id: str
    command: str
    cwd: str | None
    status: str
    exit_code: int | None
    output: str | None
    risk_level: str
    blocked_reason: str | None

class FileChangeOut(ORMModel):
    id: str
    path: str
    operation: str
    before_hash: str | None
    after_hash: str | None
    summary: str | None
