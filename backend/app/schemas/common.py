from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class Message(BaseModel):
    message: str
    detail: dict[str, Any] = {}
    retryable: bool = False

class IdResponse(BaseModel):
    id: str
