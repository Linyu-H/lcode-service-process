import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { projectService } from '../services/projects';
import type { Project } from '../types/project';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { StatusBadge } from '../components/common/StatusBadge';

export function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    local_path: `${navigator.platform.includes('Mac') ? '/Users/Shared' : '~/'}LcodeProjects/demo-project`,
    project_type: 'software',
    status: 'active'
  });

  const load = () => {
    projectService.list().then(setItems).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const create = () => {
    projectService.create(form).then(() => {
      setForm({ ...form, name: '' });
      load();
    });
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>项目管理</h1>
          <p>创建、搜索和维护本地项目目录及默认流程。</p>
        </div>
      </div>
      <div className="two-col">
        <Card>
          <h2>新建项目</h2>
          <label>名称<Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>描述<Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label>本地路径<Input value={form.local_path} onChange={e => setForm({ ...form, local_path: e.target.value })} /></label>
          <Button onClick={create} disabled={!form.name}><Plus size={16} />创建项目</Button>
        </Card>
        <Card>
          <h2>项目列表</h2>
          <table>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><span className="muted">{p.local_path}</span></td>
                  <td><StatusBadge status={p.last_run_status || p.status} /></td>
                  <td><button aria-label="删除项目" onClick={() => projectService.remove(p.id).then(load)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
