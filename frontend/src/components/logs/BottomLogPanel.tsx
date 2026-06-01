import { useEffect } from 'react';
import { Terminal, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useRunStore } from '../../stores/runStore';
import { connectEvents } from '../../services/websocket';
export function BottomLogPanel(){ const open=useAppStore(s=>s.bottomLogOpen); const toggle=useAppStore(s=>s.toggleLog); const events=useRunStore(s=>s.events); const push=useRunStore(s=>s.push); useEffect(()=>{ const ws=connectEvents(push); return ()=>ws.close(); },[push]); if(!open) return <button aria-label="打开日志面板" className="log-tab" onClick={toggle}><Terminal size={16}/>日志</button>; return <aside className="bottom-log"><header><span><Terminal size={16}/>实时事件</span><button aria-label="关闭日志面板" onClick={toggle}><X size={16}/></button></header><div>{events.length===0?<p className="muted">暂无实时事件。运行流程后将显示 WebSocket 日志。</p>:events.map((e,i)=><pre key={i}>{JSON.stringify(e,null,2)}</pre>)}</div></aside> }
