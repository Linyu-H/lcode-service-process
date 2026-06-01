from __future__ import annotations
import hashlib
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.logs import FileChange

def _hash(data: bytes | None) -> str | None:
    return hashlib.sha256(data).hexdigest() if data is not None else None

class FileService:
    def read(self, path: str) -> str:
        return Path(path).expanduser().read_text(encoding="utf-8")

    def write(self, db: Session, path: str, content: str, workflow_run_id: str | None = None, node_run_id: str | None = None) -> FileChange:
        p = Path(path).expanduser()
        before = p.read_bytes() if p.exists() else None
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        after = p.read_bytes()
        item = FileChange(path=str(p), operation="write", before_hash=_hash(before), after_hash=_hash(after), workflow_run_id=workflow_run_id, node_run_id=node_run_id, summary=f"wrote {len(content)} chars")
        db.add(item); db.commit(); db.refresh(item)
        return item

file_service = FileService()
