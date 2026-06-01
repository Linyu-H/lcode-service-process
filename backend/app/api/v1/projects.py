from __future__ import annotations
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])
@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)): return db.query(Project).order_by(Project.created_at.desc()).all()
@router.post("", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    Path(payload.local_path).expanduser().mkdir(parents=True, exist_ok=True)
    item = Project(**payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item
@router.get("/{id}", response_model=ProjectOut)
def get_project(id: str, db: Session = Depends(get_db)): return db.get(Project, id)
@router.put("/{id}", response_model=ProjectOut)
def update_project(id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    item=db.get(Project,id)
    for k,v in payload.model_dump().items(): setattr(item,k,v)
    db.add(item); db.commit(); db.refresh(item); return item
@router.delete("/{id}")
def delete_project(id: str, db: Session = Depends(get_db)):
    item=db.get(Project,id); db.delete(item); db.commit(); return {"message":"deleted"}
@router.post("/{id}/open-directory")
def open_directory(id: str, db: Session = Depends(get_db)):
    item=db.get(Project,id); return {"path": item.local_path, "message":"由 Electron preload 调用系统打开目录"}
