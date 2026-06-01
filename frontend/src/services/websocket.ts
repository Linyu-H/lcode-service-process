import { API_BASE } from './api';
export function connectEvents(onMessage: (event: any) => void) { const url = API_BASE.replace('http', 'ws') + '/ws/events'; const ws = new WebSocket(url); ws.onmessage = (e) => onMessage(JSON.parse(e.data)); return ws; }
