from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.logs import OperationLog, AIRequestLog, CommandLog, FileChange
router=APIRouter(prefix="/logs", tags=["logs"])
@router.get("/operations")
def operations(db: Session=Depends(get_db)): return db.query(OperationLog).order_by(OperationLog.created_at.desc()).limit(200).all()
@router.get("/ai-requests")
def ai_requests(db: Session=Depends(get_db)): return db.query(AIRequestLog).order_by(AIRequestLog.created_at.desc()).limit(200).all()
@router.get("/commands")
def commands(db: Session=Depends(get_db)): return db.query(CommandLog).order_by(CommandLog.created_at.desc()).limit(200).all()
@router.get("/file-changes")
def file_changes(db: Session=Depends(get_db)): return db.query(FileChange).order_by(FileChange.created_at.desc()).limit(200).all()
