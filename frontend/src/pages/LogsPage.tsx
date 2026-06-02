import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bot, Clock, FileText, Search, Terminal, User } from 'lucide-react';
import { logsService } from '../services/logs';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const tabs = [
  { key: 'operations', label: '操作日志', icon: User },
  { key: 'commands', label: '命令日志', icon: Terminal },
  { key: 'files', label: '文件变更', icon: FileText },
  { key: 'ai', label: 'AI 请求', icon: Bot }
] as const;

type TabKey = typeof tabs[number]['key'];

function textOf(item: any) {
  return [item.action, item.operation_type, item.command, item.path, item.file_path, item.status, item.message, item.error_message, item.resource_type, item.created_at]
    .filter(Boolean).join(' ');
}

function titleOf(item: any, tab: TabKey) {
  if (tab === 'commands') return item.command || item.command_text || '命令执行记录';
  if (tab === 'files') return item.file_path || item.path || '文件变更记录';
  if (tab === 'ai') return item.model || item.provider || 'AI 请求记录';
  return item.action || item.operation_type || '操作记录';
}

function statusOf(item: any) {
  return item.status || item.risk_level || item.result || (item.error_message ? 'failed' : 'ok');
}

export function LogsPage() {
  const [tab, setTab] = useState<TabKey>('operations');
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>();

  useEffect(() => {
    setLoading(true);
    logsService[tab]().then(data => {
      setItems(data);
      setSelected(data[0]);
    }).catch(() => {
      setItems([]);
      setSelected(undefined);
    }).finally(() => setLoading(false));
  }, [tab]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(item => textOf(item).toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div className="page logs-page">
      <div className="page-head">
        <div>
          <h1>执行日志</h1>
          <p>按操作、命令、文件和 AI 请求分组审计，快速定位上线前失败点。</p>
        </div>
        <label className="search-box log-search"><Search size={16} /><Input placeholder="搜索路径、命令、状态、错误" value={query} onChange={e => setQuery(e.target.value)} /></label>
      </div>

      <Card>
        <div className="tabs log-tabs">
          {tabs.map(({ key, label, icon: Icon }) => <button className={tab === key ? 'active' : ''} onClick={() => setTab(key)} key={key}><Icon size={16} />{label}</button>)}
        </div>
        <div className="logs-layout">
          <div className="log-list">
            {loading ? <div className="empty">正在加载日志...</div> : filtered.length === 0 ? <div className="empty">暂无匹配日志。运行流程或执行命令后会出现在这里。</div> : filtered.map((item, index) => (
              <button key={item.id || index} className={`log-row ${selected === item ? 'active' : ''}`} onClick={() => setSelected(item)}>
                <span className={`log-badge ${String(statusOf(item)).toLowerCase()}`}>{statusOf(item)}</span>
                <strong>{titleOf(item, tab)}</strong>
                <span className="log-summary">{item.message || item.error_message || item.resource_id || item.node_run_id || '查看详情获取完整上下文'}</span>
                <small><Clock size={13} />{item.created_at || item.started_at || '刚刚/未知时间'}</small>
              </button>
            ))}
          </div>
          <aside className="log-detail">
            <h2>{selected ? titleOf(selected, tab) : '日志详情'}</h2>
            {selected?.error_message && <div className="error-callout"><AlertTriangle size={16} />{selected.error_message}</div>}
            {selected ? <pre>{JSON.stringify(selected, null, 2)}</pre> : <p className="muted">选择左侧日志查看原始数据。</p>}
          </aside>
        </div>
      </Card>
    </div>
  );
}
