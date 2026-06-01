from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.file_service import file_service
class WriteReq(BaseModel): path: str; content: str
router=APIRouter(prefix="/files", tags=["files"])
@router.get("/read")
def read_file(path: str): return {"path": path, "content": file_service.read(path)}
@router.post("/write")
def write_file(payload: WriteReq, db: Session=Depends(get_db)): return file_service.write(db, payload.path, payload.content)
@router.post("/diff")
def diff_file(): return {"message":"diff preview reserved for V0.3"}
@router.post("/rollback")
def rollback_file(): return {"message":"rollback reserved for V0.3"}
