from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.settings import AppSetting
from app.utils.json import dumps, loads
router=APIRouter(tags=["system"])
@router.get("/system/info")
def info(): return {"name": settings.app_name, "version":"0.1.0", "data_dir": str(settings.data_path)}
@router.get("/system/settings")
def get_settings(db: Session=Depends(get_db)): return {s.key: loads(s.value_json) for s in db.query(AppSetting).all()}
@router.put("/system/settings")
def put_settings(payload: dict, db: Session=Depends(get_db)):
    for k,v in payload.items():
        item=db.query(AppSetting).filter(AppSetting.key==k).first() or AppSetting(key=k)
        item.value_json=dumps(v); db.add(item)
    db.commit(); return {"message":"saved"}
