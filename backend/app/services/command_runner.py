from __future__ import annotations
import asyncio
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.logs import CommandLog
from app.services.security_policy import security_policy

class CommandRunner:
    async def run(self, db: Session, command: str, cwd: str | None = None, timeout: int = 120, workflow_run_id: str | None = None, node_run_id: str | None = None) -> CommandLog:
        risk = security_policy.assess_command(command)
        log = CommandLog(command=command, cwd=cwd, workflow_run_id=workflow_run_id, node_run_id=node_run_id, risk_level=risk.risk_level)
        if not risk.allowed:
            log.status = "blocked"
            log.blocked_reason = risk.reason
            db.add(log); db.commit(); db.refresh(log)
            return log
        db.add(log); db.commit(); db.refresh(log)
        try:
            proc = await asyncio.create_subprocess_shell(command, cwd=str(Path(cwd).expanduser()) if cwd else None, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
            out, _ = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            log.exit_code = proc.returncode
            log.output = out.decode(errors="replace")[-20000:]
            log.status = "success" if proc.returncode == 0 else "failed"
        except asyncio.TimeoutError:
            log.status = "timeout"
            log.output = f"Command timed out after {timeout}s"
        except Exception as exc:
            log.status = "failed"
            log.output = str(exc)
        db.add(log); db.commit(); db.refresh(log)
        return log

command_runner = CommandRunner()
