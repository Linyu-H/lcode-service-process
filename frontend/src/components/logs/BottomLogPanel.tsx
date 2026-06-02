import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle, ClipboardList, Terminal, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useRunStore } from '../../stores/runStore';
import { connectEvents } from '../../services/websocket';

function eventTitle(event: any) {
  return event.type || event.event || event.status || 'workflow.event';
}

function eventSummary(event: any) {
  return event.message || event.log || event.output || event.node_name || event.workflow_id || JSON.stringify(event).slice(0, 120);
}

function iconFor(event: any) {
  const type = String(eventTitle(event));
  if (type.includes('command')) return Terminal;
  if (type.includes('ai')) return Bot;
  if (type.includes('completed') || type.includes('success')) return CheckCircle;
  return ClipboardList;
}

export function BottomLogPanel() {
  const open = useAppStore(s => s.bottomLogOpen);
  const toggle = useAppStore(s => s.toggleLog);
  const events = useRunStore(s => s.events);
  const push = useRunStore(s => s.push);
  const clear = useRunStore(s => s.clear);
  const [raw, setRaw] = useState(false);

  useEffect(() => {
    const ws = connectEvents(push);
    return () => ws.close();
  }, [push]);

  const latest = useMemo(() => events.slice(0, 60), [events]);

  if (!open) return <button aria-label="打开日志面板" className="log-tab" onClick={toggle}><Terminal size={16} />实时日志{events.length > 0 && <span>{events.length}</span>}</button>;

  return (
    <aside className="bottom-log">
      <header>
        <span><Terminal size={16} />实时事件 <small>{events.length} 条</small></span>
        <div className="bottom-log-actions">
          <button onClick={() => setRaw(!raw)}>{raw ? '卡片视图' : '原始 JSON'}</button>
          <button aria-label="清空日志" onClick={clear}><Trash2 size={15} /></button>
          <button aria-label="关闭日志面板" onClick={toggle}><X size={16} /></button>
        </div>
      </header>
      <div className="event-stream">
        {latest.length === 0 ? <p className="muted">暂无实时事件。运行流程后会显示节点状态、命令输出、AI 流和错误。</p> : latest.map((event, index) => {
          const Icon = iconFor(event);
          return raw ? <pre key={index}>{JSON.stringify(event, null, 2)}</pre> : (
            <article className="event-card" key={index}>
              <Icon size={16} />
              <div>
                <strong>{eventTitle(event)}</strong>
                <p>{eventSummary(event)}</p>
              </div>
              <span>{event.created_at || event.timestamp || 'live'}</span>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
