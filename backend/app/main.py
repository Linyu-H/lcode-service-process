from __future__ import annotations
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import init_db
from app.services.websocket_manager import ws_manager

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup(): init_db()

@app.get("/health")
def health(): return {"status":"ok", "name": settings.app_name}

@app.head("/health")
def health_head(): return None

app.include_router(api_router, prefix=settings.api_prefix)

@app.websocket("/ws/events")
async def ws_events(websocket: WebSocket):
    await ws_manager.connect_events(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.websocket("/ws/runs/{run_id}")
async def ws_run(run_id: str, websocket: WebSocket):
    await ws_manager.connect_run(run_id, websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
