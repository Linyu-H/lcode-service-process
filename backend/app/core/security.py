from __future__ import annotations
from fastapi import HTTPException

def api_error(message: str, status_code: int = 400, detail: dict | None = None):
    raise HTTPException(status_code=status_code, detail={"message": message, "detail": detail or {}, "retryable": status_code >= 500})
