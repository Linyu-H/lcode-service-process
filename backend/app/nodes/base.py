from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from sqlalchemy.orm import Session

@dataclass
class NodeContext:
    db: Session
    workflow_run_id: str
    node_run_id: str
    config: dict[str, Any]
    upstream: dict[str, Any]
    model_id: str | None = None

@dataclass
class NodeResult:
    success: bool
    output: dict[str, Any]
    error: str | None = None

class BaseNode:
    node_type = "base"
    async def execute(self, ctx: NodeContext) -> NodeResult:
        raise NotImplementedError
