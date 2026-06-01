from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.encryption import encryption_service
from app.models.ai import AIProvider, AIModel
from app.schemas.ai import *

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/providers", response_model=list[AIProviderOut])
def list_providers(db: Session = Depends(get_db)):
    return db.query(AIProvider).order_by(AIProvider.created_at.desc()).all()

@router.post("/providers", response_model=AIProviderOut)
def create_provider(payload: AIProviderCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"api_key"})
    item = AIProvider(**data, api_key_encrypted=encryption_service.encrypt(payload.api_key), api_key_masked=encryption_service.mask(payload.api_key))
    db.add(item); db.commit(); db.refresh(item); return item

@router.get("/providers/{id}", response_model=AIProviderOut)
def get_provider(id: str, db: Session = Depends(get_db)): return db.get(AIProvider, id)

@router.put("/providers/{id}", response_model=AIProviderOut)
def update_provider(id: str, payload: AIProviderUpdate, db: Session = Depends(get_db)):
    item = db.get(AIProvider, id)
    for k,v in payload.model_dump(exclude={"api_key"}).items(): setattr(item,k,v)
    if payload.api_key:
        item.api_key_encrypted = encryption_service.encrypt(payload.api_key); item.api_key_masked = encryption_service.mask(payload.api_key)
    db.add(item); db.commit(); db.refresh(item); return item

@router.delete("/providers/{id}")
def delete_provider(id: str, db: Session = Depends(get_db)):
    item = db.get(AIProvider, id); db.delete(item); db.commit(); return {"message":"deleted"}

@router.post("/providers/{id}/test")
def test_provider(id: str, db: Session = Depends(get_db)):
    item = db.get(AIProvider, id)
    return {"ok": bool(item and item.base_url), "message": "配置存在，真实连通性将在配置 API Key 后验证"}

@router.get("/models", response_model=list[AIModelOut])
def list_models(db: Session = Depends(get_db)): return db.query(AIModel).order_by(AIModel.created_at.desc()).all()

@router.post("/models", response_model=AIModelOut)
def create_model(payload: AIModelCreate, db: Session = Depends(get_db)):
    item = AIModel(**payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item

@router.put("/models/{id}", response_model=AIModelOut)
def update_model(id: str, payload: AIModelUpdate, db: Session = Depends(get_db)):
    item = db.get(AIModel, id)
    for k,v in payload.model_dump().items(): setattr(item,k,v)
    db.add(item); db.commit(); db.refresh(item); return item

@router.delete("/models/{id}")
def delete_model(id: str, db: Session = Depends(get_db)):
    item = db.get(AIModel, id); db.delete(item); db.commit(); return {"message":"deleted"}

@router.post("/models/{id}/set-default")
def set_default(id: str, db: Session = Depends(get_db)):
    model = db.get(AIModel, id)
    for m in db.query(AIModel).filter(AIModel.role == model.role).all(): m.is_default = False
    model.is_default = True; db.commit(); return {"message":"ok"}
