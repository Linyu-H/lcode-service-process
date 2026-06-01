from __future__ import annotations
from sqlalchemy.orm import Session
from app.models.logs import OperationLog

def log_operation(db: Session, action: str, resource_type: str, resource_id: str | None = None, summary: str | None = None, risk_level: str = "low", allowed: bool = True, error_message: str | None = None):
    item = OperationLog(action=action, resource_type=resource_type, resource_id=resource_id, summary=summary, risk_level=risk_level, allowed=allowed, error_message=error_message)
    db.add(item)
    db.commit()
    return item
