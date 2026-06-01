from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import NodeTemplate
from app.schemas.workflow import NodeTemplateCreate, NodeTemplateOut
from app.services.node_registry import node_registry
from app.services.security_policy import security_policy
from app.utils.json import dumps

router = APIRouter(tags=["nodes"])

@router.get("/node-templates", response_model=list[NodeTemplateOut])
def list_templates(db: Session = Depends(get_db)):
    existing = db.query(NodeTemplate).all()
    if not existing:
        for template in node_registry.templates():
            db.add(NodeTemplate(**template, schema_json=dumps({}), default_config_json=dumps({})))
        db.commit()
        existing = db.query(NodeTemplate).all()
    return existing

@router.post("/node-templates", response_model=NodeTemplateOut)
def create_template(payload: NodeTemplateCreate, db: Session = Depends(get_db)):
    item = NodeTemplate(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/node-templates/{id}", response_model=NodeTemplateOut)
def update_template(id: str, payload: NodeTemplateCreate, db: Session = Depends(get_db)):
    item = db.get(NodeTemplate, id)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/node-templates/{id}")
def delete_template(id: str, db: Session = Depends(get_db)):
    item = db.get(NodeTemplate, id)
    db.delete(item)
    db.commit()
    return {"message": "deleted"}

@router.post("/nodes/test")
def test_node(payload: dict):
    node_type = payload.get("node_type")
    config = payload.get("config", {})
    if node_type == "command":
        risk = security_policy.assess_command(config.get("command", ""), bool(config.get("require_confirmation")))
        return {"node_type": node_type, "valid": risk.allowed, "risk_level": risk.risk_level, "message": risk.reason or "命令节点配置可执行"}
    return {"node_type": node_type, "valid": node_registry.get(node_type) is not None, "message": "节点类型已注册" if node_registry.get(node_type) else "节点类型未实现或为预留节点"}
