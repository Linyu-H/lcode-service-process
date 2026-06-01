from __future__ import annotations
import json
from typing import Any

def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)

def loads(value: str | None, default: Any = None) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default
