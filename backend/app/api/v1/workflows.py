from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow
from app.schemas.workflow import *
from app.services.workflow_engine import workflow_engine
from app.utils.json import loads

router = APIRouter(prefix="/workflows", tags=["workflows"])
@router.get("", response_model=list[WorkflowOut])
def list_workflows(db: Session = Depends(get_db)): return db.query(Workflow).order_by(Workflow.created_at.desc()).all()
@router.post("", response_model=WorkflowOut)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    item=Workflow(**payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item
@router.get("/{id}", response_model=WorkflowOut)
def get_workflow(id: str, db: Session = Depends(get_db)): return db.get(Workflow,id)
@router.put("/{id}", response_model=WorkflowOut)
def update_workflow(id: str, payload: WorkflowUpdate, db: Session = Depends(get_db)):
    item=db.get(Workflow,id)
    for k,v in payload.model_dump().items(): setattr(item,k,v)
    db.add(item); db.commit(); db.refresh(item); return item
@router.delete("/{id}")
def delete_workflow(id: str, db: Session = Depends(get_db)):
    item=db.get(Workflow,id); db.delete(item); db.commit(); return {"message":"deleted"}
@router.post("/{id}/validate", response_model=ValidationResult)
def validate_workflow(id: str, db: Session = Depends(get_db)):
    wf=db.get(Workflow,id); errors,warnings=workflow_engine.validate_graph(loads(wf.graph_json,{})); return ValidationResult(valid=not errors, errors=errors, warnings=warnings)
@router.post("/{id}/duplicate", response_model=WorkflowOut)
def duplicate_workflow(id: str, db: Session = Depends(get_db)):
    wf=db.get(Workflow,id); item=Workflow(project_id=wf.project_id,name=wf.name+" Copy",description=wf.description,graph_json=wf.graph_json,status="draft"); db.add(item); db.commit(); db.refresh(item); return item
@router.get("/{id}/export")
def export_workflow(id: str, db: Session = Depends(get_db)):
    wf=db.get(Workflow,id); return {"workflow": WorkflowOut.model_validate(wf).model_dump(), "graph": loads(wf.graph_json,{}), "version": wf.version, "exported_at": datetime.now(timezone.utc).isoformat()}
@router.post("/import", response_model=WorkflowOut)
def import_workflow(payload: ImportWorkflowRequest, db: Session = Depends(get_db)):
    meta=payload.payload.get("workflow",{}); graph=payload.payload.get("graph", {"nodes":[],"edges":[]}); item=Workflow(name=meta.get("name","Imported workflow"), description=meta.get("description"), project_id=meta.get("project_id"), graph_json=__import__('json').dumps(graph, ensure_ascii=False)); db.add(item); db.commit(); db.refresh(item); return item
