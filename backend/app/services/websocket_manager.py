from __future__ import annotations
import json
from collections import defaultdict
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self) -> None:
        self._events: set[WebSocket] = set()
        self._runs: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect_events(self, websocket: WebSocket):
        await websocket.accept()
        self._events.add(websocket)

    async def connect_run(self, run_id: str, websocket: WebSocket):
        await websocket.accept()
        self._runs[run_id].add(websocket)

    def disconnect(self, websocket: WebSocket):
        self._events.discard(websocket)
        for clients in self._runs.values():
            clients.discard(websocket)

    async def broadcast(self, event: dict, run_id: str | None = None):
        text = json.dumps(event, ensure_ascii=False, default=str)
        targets = set(self._events)
        if run_id:
            targets |= self._runs.get(run_id, set())
        dead = []
        for ws in targets:
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

ws_manager = WebSocketManager()
