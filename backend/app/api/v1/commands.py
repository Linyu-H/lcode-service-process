from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.logs import CommandLog
from app.services.command_runner import command_runner
class CommandReq(BaseModel): command: str; cwd: str | None=None; timeout: int=120
router=APIRouter(prefix="/commands", tags=["commands"])
@router.post("/run")
async def run_command(payload: CommandReq, db: Session=Depends(get_db)): return await command_runner.run(db, payload.command, payload.cwd, payload.timeout)
@router.post("/{id}/stop")
def stop_command(id: str): return {"message":"stop signal reserved", "id": id}
@router.get("/{id}/logs")
def command_logs(id: str, db: Session=Depends(get_db)): return db.get(CommandLog,id)
