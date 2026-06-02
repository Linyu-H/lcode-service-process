import { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle, KeyRound, Plus, Shield } from 'lucide-react';
import { aiService } from '../services/ai';
import type { AIModel, AIProvider } from '../types/ai';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/common/StatusBadge';

const roleLabels: Record<string, string> = {
  planning: '规划模型',
  coding: '编码模型',
  review: '审查模型',
  summary: '总结模型',
  fast: '快速模型',
  fallback: '兜底模型',
  custom: '自定义模型'
};

export function AISettingsPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState({ name: 'OpenAI Compatible', provider_type: 'custom_openai_compatible', base_url: 'https://api.openai.com/v1', api_key: '' });
  const [model, setModel] = useState({ name: 'gpt-4o-mini', display_name: 'Default Coding Model', role: 'coding', provider_id: '', max_context_tokens: 128000, max_output_tokens: 4096, temperature: 0.2, top_p: 1, is_default: true, is_active: true });

  const load = () => {
    Promise.all([aiService.providers(), aiService.models()]).then(([p, m]) => {
      setProviders(p);
      setModels(m);
      if (!model.provider_id && p[0]?.id) setModel(existing => ({ ...existing, provider_id: p[0].id }));
    }).catch(() => setMessage('AI 配置加载失败，请确认后端服务在线。'));
  };

  useEffect(load, []);

  const stats = useMemo(() => ({
    providers: providers.length,
    activeProviders: providers.filter(p => p.is_active).length,
    models: models.length,
    defaults: models.filter(m => m.is_default).length
  }), [providers, models]);

  const saveProvider = async () => {
    await aiService.createProvider(provider);
    setProvider({ ...provider, api_key: '' });
    setMessage('服务商已保存，API Key 已按后端策略加密/脱敏。');
    load();
  };

  const saveModel = async () => {
    await aiService.createModel(model);
    setMessage('模型已保存，可在流程节点中作为默认/角色模型使用。');
    load();
  };

  return (
    <div className="page ai-settings-page">
      <div className="page-head">
        <div>
          <h1>AI 模型配置</h1>
          <p>配置 Provider、Base URL、API Key 和角色模型；敏感字段不明文回显，流程节点运行时复用这些配置。</p>
        </div>
        <Button variant="secondary" onClick={() => setMessage('连接测试入口已预留：保存 Provider 后可在后续版本接入真实模型 ping。')}><CheckCircle size={16} />测试连接</Button>
      </div>

      <div className="metric-grid compact-metrics">
        <Card><span className="muted">服务商</span><strong className="metric">{stats.providers}</strong></Card>
        <Card><span className="muted">启用服务商</span><strong className="metric">{stats.activeProviders}</strong></Card>
        <Card><span className="muted">模型数量</span><strong className="metric">{stats.models}</strong></Card>
        <Card><span className="muted">默认模型</span><strong className="metric">{stats.defaults}</strong></Card>
      </div>

      <div className="two-col ai-config-grid">
        <Card>
          <h2><KeyRound size={18} />新增服务商</h2>
          <label>名称<Input value={provider.name} onChange={e => setProvider({ ...provider, name: e.target.value })} /></label>
          <label>Provider 类型<Input value={provider.provider_type} onChange={e => setProvider({ ...provider, provider_type: e.target.value })} /></label>
          <label>Base URL<Input value={provider.base_url} onChange={e => setProvider({ ...provider, base_url: e.target.value })} /></label>
          <label>API Key<Input type="password" value={provider.api_key} onChange={e => setProvider({ ...provider, api_key: e.target.value })} /></label>
          <div className="form-hint"><Shield size={14} />API Key 不会明文写日志，前端列表只显示脱敏版本。</div>
          <Button onClick={saveProvider}><Plus size={16} />保存服务商</Button>
        </Card>

        <Card>
          <h2><Brain size={18} />新增模型</h2>
          <label>服务商<select className="input" value={model.provider_id} onChange={e => setModel({ ...model, provider_id: e.target.value })}><option value="">选择 Provider</option>{providers.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
          <label>模型名<Input value={model.name} onChange={e => setModel({ ...model, name: e.target.value })} /></label>
          <label>显示名<Input value={model.display_name} onChange={e => setModel({ ...model, display_name: e.target.value })} /></label>
          <label>角色<select className="input" value={model.role} onChange={e => setModel({ ...model, role: e.target.value })}>{Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <Button onClick={saveModel} disabled={!model.provider_id}>保存模型</Button>
        </Card>
      </div>

      {message && <Card className="notice-card">{message}</Card>}

      <Card>
        <h2>服务商</h2>
        {providers.length === 0 ? <div className="empty">暂无服务商。先新增一个 OpenAI Compatible / Anthropic / Local Provider。</div> : <div className="list-grid ai-list">{providers.map(p => <div className="list-item" key={p.id}><strong>{p.name}</strong><span>{p.base_url}</span><StatusBadge status={p.is_active ? 'active' : 'disabled'} /><code>{p.api_key_masked || '未配置 Key'}</code></div>)}</div>}
      </Card>

      <Card>
        <h2>模型</h2>
        {models.length === 0 ? <div className="empty">暂无模型。新增模型后可在 AI 任务节点中调用。</div> : <div className="list-grid ai-list">{models.map(m => <div className="list-item" key={m.id}><strong>{m.display_name}</strong><span>{m.name}</span><StatusBadge status={roleLabels[m.role] || m.role} />{m.is_default && <code>默认</code>}</div>)}</div>}
      </Card>
    </div>
  );
}
