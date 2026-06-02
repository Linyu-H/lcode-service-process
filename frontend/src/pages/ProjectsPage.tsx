import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, GitBranch, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { projectService } from '../services/projects';
import type { Project } from '../types/project';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { StatusBadge } from '../components/common/StatusBadge';

const defaultPath = `${navigator.platform.includes('Mac') ? '/Users/Shared' : '~'}${navigator.platform.includes('Mac') ? '/LcodeProjects' : '/LcodeProjects'}/new-project`;

export function ProjectsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    local_path: defaultPath,
    project_type: 'software',
    status: 'active'
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(p => [p.name, p.description, p.local_path, p.status].some(v => String(v || '').toLowerCase().includes(needle)));
  }, [items, query]);

  const load = () => {
    setLoading(true);
    projectService.list().then(setItems).catch(() => setMessage('项目列表加载失败，请确认后端服务在线。')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const choosePath = async () => {
    if (!window.lcode?.selectDirectory) {
      setMessage('当前在浏览器预览模式，无法打开系统目录选择器，请手动输入路径。');
      return;
    }
    const dir = await window.lcode.selectDirectory();
    if (dir) setForm({ ...form, local_path: dir });
  };

  const create = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    setMessage('正在创建项目目录并初始化项目记录...');
    try {
      const project = await projectService.create({ ...form, name: form.name.trim() });
      setForm({ ...form, name: '', description: '', local_path: `${project.local_path}/workflow` });
      setMessage(`项目「${project.name}」创建成功，正在进入流程拖拽页。`);
      load();
      navigate(`/workflow/${project.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '创建项目失败');
    } finally {
      setCreating(false);
    }
  };

  const openDirectory = async (project: Project) => {
    try {
      if (window.lcode?.openDirectory) await window.lcode.openDirectory(project.local_path);
      else await projectService.openDirectory(project.id);
    } catch {
      setMessage('打开目录失败，请检查路径是否存在或 Electron 权限是否可用。');
    }
  };

  const remove = async (project: Project) => {
    if (!confirm(`确认删除项目「${project.name}」？不会删除本地目录。`)) return;
    await projectService.remove(project.id);
    setMessage(`已删除项目记录：${project.name}`);
    load();
  };

  return (
    <div className="page projects-page">
      <div className="page-head">
        <div>
          <h1>项目管理</h1>
          <p>创建项目后自动进入流程拖拽页；也可从列表一键打开流程、目录和运行状态。</p>
        </div>
        <div className="toolbar"><Button onClick={() => navigate('/workflow')} variant="secondary"><GitBranch size={16} />新建流程</Button></div>
      </div>

      <div className="two-col projects-layout">
        <Card className="project-create-card">
          <h2><Plus size={18} />新建项目</h2>
          <label>项目名称<Input placeholder="例如：企业官网自动化搭建" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>项目描述<Textarea placeholder="写清楚目标、技术栈、上线要求，后续流程节点会复用这些上下文。" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label>本地路径
            <div className="path-picker">
              <Input value={form.local_path} onChange={e => setForm({ ...form, local_path: e.target.value })} />
              <Button type="button" variant="secondary" onClick={choosePath}><FolderOpen size={16} />选择路径</Button>
            </div>
          </label>
          <div className="form-hint">创建后会自动建目录并跳转到该项目的流程编辑器，减少上线前重复点击。</div>
          <Button onClick={create} disabled={!form.name.trim() || creating}>{creating ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}{creating ? '创建中' : '创建项目并进入流程'}</Button>
          {message && <p className="notice">{message}</p>}
        </Card>

        <Card className="project-list-card">
          <div className="section-head">
            <h2>项目列表</h2>
            <label className="search-box"><Search size={16} /><Input placeholder="搜索名称、路径、状态" value={query} onChange={e => setQuery(e.target.value)} /></label>
          </div>
          {loading ? <p className="muted">正在加载项目...</p> : filtered.length === 0 ? <div className="empty">暂无项目。创建第一个项目后会自动进入流程页。</div> : (
            <div className="project-cards">
              {filtered.map(p => (
                <article key={p.id} className="project-card-row">
                  <div>
                    <strong>{p.name}</strong>
                    <p>{p.description || '暂无描述'}</p>
                    <span className="path-text">{p.local_path}</span>
                  </div>
                  <StatusBadge status={p.last_run_status || p.status} />
                  <div className="row-actions">
                    <Button variant="primary" onClick={() => navigate(`/workflow/${p.id}`)}><GitBranch size={15} />流程</Button>
                    <Button variant="secondary" onClick={() => openDirectory(p)}><FolderOpen size={15} />目录</Button>
                    <button className="icon-danger" aria-label="删除项目" onClick={() => remove(p)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
