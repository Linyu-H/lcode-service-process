from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.run import WorkflowRun, ConfirmRequest
from app.schemas.run import WorkflowRunOut, RunCreate, ConfirmAction
from app.services.workflow_engine import workflow_engine
router=APIRouter(tags=["runs"])
@router.get("/runs", response_model=list[WorkflowRunOut])
def list_runs(db: Session=Depends(get_db)): return db.query(WorkflowRun).order_by(WorkflowRun.created_at.desc()).all()
@router.post("/workflows/{id}/run", response_model=WorkflowRunOut)
async def run_workflow(id: str, payload: RunCreate | None=None, db: Session=Depends(get_db)): return await workflow_engine.run_workflow(db, id, payload.input_json if payload else None)
@router.get("/runs/{id}", response_model=WorkflowRunOut)
def get_run(id: str, db: Session=Depends(get_db)): return db.get(WorkflowRun,id)
@router.post("/runs/{id}/pause")
def pause_run(id: str, db: Session=Depends(get_db)): r=db.get(WorkflowRun,id); r.status="paused"; db.commit(); return {"message":"paused"}
@router.post("/runs/{id}/resume")
def resume_run(id: str, db: Session=Depends(get_db)): r=db.get(WorkflowRun,id); r.status="running"; db.commit(); return {"message":"resumed"}
@router.post("/runs/{id}/stop")
def stop_run(id: str, db: Session=Depends(get_db)): r=db.get(WorkflowRun,id); r.status="cancelled"; db.commit(); return {"message":"cancelled"}
@router.post("/runs/{id}/retry-node/{node_run_id}")
def retry_node(id: str, node_run_id: str): return {"message":"retry queued", "node_run_id": node_run_id}
@router.post("/runs/{id}/skip-node/{node_run_id}")
def skip_node(id: str, node_run_id: str): return {"message":"skipped", "node_run_id": node_run_id}
@router.post("/confirm-requests/{id}/approve")
def approve(id: str, payload: ConfirmAction, db: Session=Depends(get_db)): c=db.get(ConfirmRequest,id); c.status="approved"; db.commit(); return {"message":"approved"}
@router.post("/confirm-requests/{id}/reject")
def reject(id: str, payload: ConfirmAction, db: Session=Depends(get_db)): c=db.get(ConfirmRequest,id); c.status="rejected"; db.commit(); return {"message":"rejected"}
