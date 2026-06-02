import { useEffect, useMemo, useState } from 'react';
import { Boxes, Search, Sparkles } from 'lucide-react';
import { workflowService } from '../services/workflows';
import type { NodeTemplate } from '../types/workflow';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Input } from '../components/ui/Input';

const allCategory = '全部';

export function NodeLibraryPage() {
  const [items, setItems] = useState<NodeTemplate[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(allCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    workflowService.templates().then(setItems).catch(() => setError('节点模板加载失败，请确认后端服务在线。')).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [allCategory, ...Array.from(new Set(items.map(item => item.category || '未分类')))], [items]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(item => {
      const matchCategory = category === allCategory || item.category === category;
      const matchText = !needle || [item.name, item.node_type, item.category, item.description].some(v => String(v || '').toLowerCase().includes(needle));
      return matchCategory && matchText;
    });
  }, [items, query, category]);
  const executable = items.filter(item => item.executable).length;

  return (
    <div className="page node-library-page">
      <div className="page-head">
        <div>
          <h1>节点库</h1>
          <p>覆盖产品、研发、AI、工具、质量、交付和控制节点；可执行节点用于当前 V0.1 闭环，预留节点用于后续扩展。</p>
        </div>
        <label className="search-box"><Search size={16} /><Input placeholder="搜索节点名称、类型、说明" value={query} onChange={e => setQuery(e.target.value)} /></label>
      </div>

      <div className="metric-grid compact-metrics">
        <Card><span className="muted">节点总数</span><strong className="metric">{items.length}</strong></Card>
        <Card><span className="muted">当前可执行</span><strong className="metric">{executable}</strong></Card>
        <Card><span className="muted">企业预留</span><strong className="metric">{items.length - executable}</strong></Card>
        <Card><span className="muted">分类数量</span><strong className="metric">{Math.max(categories.length - 1, 0)}</strong></Card>
      </div>

      <Card>
        <div className="tabs node-tabs">
          {categories.map(name => <button key={name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
        {loading ? <div className="empty">正在加载节点库...</div> : error ? <div className="empty">{error}</div> : filtered.length === 0 ? <div className="empty">没有匹配节点。</div> : (
          <div className="node-grid enriched-node-grid">
            {filtered.map(node => (
              <Card key={node.id} className="node-template-card">
                <div className="node-template-head">
                  <span className="node-icon"><Boxes size={18} /></span>
                  <div><h2>{node.name}</h2><code>{node.node_type}</code></div>
                  <StatusBadge status={node.executable ? '可执行' : '预留'} />
                </div>
                <p>{node.description || '暂无描述'}</p>
                <div className="node-template-foot"><span>{node.category}</span>{node.executable ? <strong>可直接运行</strong> : <em><Sparkles size={13} />模板占位</em>}</div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
