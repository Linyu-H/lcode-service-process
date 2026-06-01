from __future__ import annotations
import re
from dataclasses import dataclass

@dataclass
class RiskResult:
    allowed: bool
    risk_level: str
    reason: str | None = None

DANGEROUS = [
    (r"\brm\s+-rf\s+(/|~|\$HOME)?\b", "critical", "dangerous recursive delete"),
    (r"\bsudo\b", "critical", "sudo is not allowed"),
    (r"chmod\s+-R\s+777", "high", "wide-open permissions"),
    (r"chown\s+-R", "high", "recursive ownership changes"),
    (r"\bmkfs\b", "critical", "filesystem formatting"),
    (r"\bdd\s+if=", "critical", "raw disk write command"),
    (r":\(\)\{\s*:\|:&\s*\};:", "critical", "fork bomb"),
    (r"git\s+push", "critical", "remote push requires explicit confirmation"),
    (r"git\s+reset\s+--hard", "high", "hard reset can destroy work"),
    (r"docker\s+system\s+prune", "high", "docker prune can delete data"),
]

class SecurityPolicyService:
    def assess_command(self, command: str, require_confirmation: bool = False) -> RiskResult:
        for pattern, level, reason in DANGEROUS:
            if re.search(pattern, command, re.IGNORECASE):
                return RiskResult(False, level, reason)
        if require_confirmation:
            return RiskResult(False, "high", "confirmation required")
        mutating = any(token in command for token in ["npm install", "pip install", ">", "mv ", "cp ", "git commit"])
        return RiskResult(True, "medium" if mutating else "low")

security_policy = SecurityPolicyService()
