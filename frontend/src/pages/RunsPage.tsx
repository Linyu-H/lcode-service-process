import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ScrollText, Square, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { runsService } from '../services/runs';
import type { WorkflowRun } from '../types/run';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';

export function RunsPage() {
  const [items, setItems] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const load = () => {
    setLoading(true);
    runsService.list().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    running: items.filter(item => item.status === 'running').length,
    success: items.filter(item => item.status === 'success').length,
    failed: items.filter(item => item.status === 'failed').length,
  }), [items]);

  return (
    <div className="page runs-page">
      <div className="page-head">
        <div>
          <h1>运行任务</h1>
          <p>监控工作流运行状态、当前节点、进度和失败原因，是上线前排查闭环问题的核心页面。</p>
        </div>
        <div className="toolbar">
          <Link to="/logs"><Button variant="secondary"><ScrollText size={16} />查看日志</Button></Link>
          <Button onClick={load} variant="secondary"><RefreshCw size={16} />{loading ? '刷新中' : '刷新'}</Button>
        </div>
      </div>

      <div className="metric-grid compact-metrics">
        <Card><span className="muted">运行总数</span><strong className="metric">{stats.total}</strong></Card>
        <Card><span className="muted">运行中</span><strong className="metric">{stats.running}</strong></Card>
        <Card><span className="muted">成功</span><strong className="metric">{stats.success}</strong></Card>
        <Card><span className="muted">失败</span><strong className="metric">{stats.failed}</strong></Card>
      </div>

      <Card>
        {items.length === 0 ? <div className="empty">暂无运行任务。请到流程编辑器点击“运行”创建第一条运行记录。</div> : (
          <div className="run-list">
            {items.map(run => (
              <article className="run-card" key={run.id}>
                <div className="run-main">
                  <div>
                    <strong>运行 #{run.id.slice(0, 8)}</strong>
                    <p>Workflow: <code>{run.workflow_id}</code></p>
                  </div>
                  <StatusBadge status={run.status} />
                </div>
                <div className="run-progress">
                  <div><span>当前节点：{run.current_node_key || '-'}</span><span>{run.progress}%</span></div>
                  <progress value={run.progress} max={100} />
                </div>
                {run.error_message && <div className="error-callout">{run.error_message}</div>}
                <div className="run-actions">
                  <span><Timer size={14} />实时轮询中</span>
                  <Button variant="danger" onClick={() => runsService.stop(run.id).then(load)}><Square size={14} />停止</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
