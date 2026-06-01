from __future__ import annotations
from fastapi import APIRouter
from app.api.v1 import ai, projects, workflows, nodes, runs, files, commands, logs, system
api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(ai.router)
api_router.include_router(projects.router)
api_router.include_router(workflows.router)
api_router.include_router(nodes.router)
api_router.include_router(runs.router)
api_router.include_router(files.router)
api_router.include_router(commands.router)
api_router.include_router(logs.router)
