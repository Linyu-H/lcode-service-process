import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addEdge, Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, useEdgesState, useNodesState, type Connection, type Edge, type Node } from '@xyflow/react';
import { CheckCircle, Download, Expand, Minimize2, Play, Plus, Save, Search, Upload } from 'lucide-react';
import { workflowService } from '../services/workflows';
import { projectService } from '../services/projects';
import type { Project } from '../types/project';
import type { Workflow } from '../types/workflow';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';

const initialNodes: Node[] = [
  { id: 'start', type: 'workflowNode', position: { x: 80, y: 180 }, data: { label: '开始：读取项目目标', node_type: 'start', config: { auto_mode: true } } },
  { id: 'ai-task', type: 'workflowNode', position: { x: 390, y: 180 }, data: { label: 'AI 任务：分析与计划', node_type: 'ai_task', config: { prompt: '请总结项目目标并输出下一步执行计划' } } },
  { id: 'command', type: 'workflowNode', position: { x: 720, y: 180 }, data: { label: '命令：测试/构建', node_type: 'command', config: { command: 'npm run build', cwd: '.' } } },
  { id: 'end', type: 'workflowNode', position: { x: 1040, y: 180 }, data: { label: '结束：交付总结', node_type: 'end', config: {} } }
];
const makeWorkflowEdge = (id: string, source: string, target: string, kind: 'success' | 'error' = 'success'): Edge => ({
  id,
  source,
  target,
  label: kind === 'error' ? '异常' : undefined,
  data: { kind },
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: kind === 'error' ? '#EF4444' : '#22C55E', width: 16, height: 16 },
  animated: kind === 'error',
  className: `workflow-edge workflow-edge-${kind}`,
  style: { stroke: kind === 'error' ? '#EF4444' : '#22C55E', strokeWidth: kind === 'error' ? 3.5 : 3 },
  labelStyle: { fill: kind === 'error' ? '#EF4444' : '#22C55E', fontWeight: 700 },
  labelBgStyle: { fill: kind === 'error' ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)' }
});

const initialEdges: Edge[] = [
  makeWorkflowEdge('e1', 'start', 'ai-task'),
  makeWorkflowEdge('e2', 'ai-task', 'command'),
  makeWorkflowEdge('e3', 'command', 'end')
];

const nodeCatalog: Array<{ type: string; label: string; group: string; config?: Record<string, unknown> }> = [
  { type: 'start', label: '开始节点', group: '基础', config: { auto_mode: true } },
  { type: 'requirement', label: '需求澄清节点', group: '产品', config: { questions: [], output: 'requirements.md' } },
  { type: 'product_design', label: '产品设计节点', group: '产品', config: { deliverable: 'prd.md' } },
  { type: 'architecture', label: '技术架构节点', group: '研发', config: { output: 'architecture.md' } },
  { type: 'ui_design', label: 'UI 设计节点', group: '研发', config: { style: 'professional light/dark workflow UI' } },
  { type: 'ai_task', label: 'AI 任务节点', group: 'AI', config: { prompt: '请总结项目目标并输出下一步执行计划' } },
  { type: 'code_generation', label: '代码生成节点', group: 'AI', config: { target: 'frontend/backend', allow_write: true } },
  { type: 'command', label: '命令执行节点', group: '工具', config: { command: 'npm run build', cwd: '.' } },
  { type: 'test', label: '测试验证节点', group: '质量', config: { command: 'npm run typecheck && npm run build', cwd: '.' } },
  { type: 'auto_fix', label: '自动修复节点', group: '质量', config: { max_rounds: 3 } },
  { type: 'git_commit', label: 'Git 提交节点', group: '交付', config: { message: 'chore: workflow checkpoint', require_confirmation: true } },
  { type: 'deploy', label: '部署节点', group: '交付', config: { target: 'staging', require_confirmation: true } },
  { type: 'file_operation', label: '文件操作节点', group: '工具', config: { operation: 'read/write/diff' } },
  { type: 'http_request', label: 'HTTP 请求节点', group: '工具', config: { method: 'GET', url: '' } },
  { type: 'manual_confirm', label: '人工确认节点', group: '控制', config: { reason: '高风险操作确认' } },
  { type: 'mcp', label: 'MCP 工具节点', group: '工具', config: { server: '', tool: '' } },
  { type: 'skill', label: 'Skill 节点', group: 'AI', config: { skill: '' } },
  { type: 'condition', label: '条件分支节点', group: '控制', config: { expression: 'status == success' } },
  { type: 'parallel', label: '并行执行节点', group: '控制', config: { strategy: 'all' } },
  { type: 'loop', label: '循环节点', group: '控制', config: { max_iterations: 3 } },
  { type: 'data_transform', label: '数据转换节点', group: '工具', config: { format: 'json' } },
  { type: 'doc_generation', label: '文档生成节点', group: '交付', config: { target: 'README.md' } },
  { type: 'end', label: '结束节点', group: '基础', config: {} }
];

function WorkflowNodeCard({ data }: { data: any }) {
  const type = String(data.node_type || 'node');
  const title = String(data.label || type);
  const group = nodeCatalog.find(node => node.type === type)?.group || '节点';
  return (
    <div className={`workflow-node-card node-kind-${type.replace(/_/g, '-')}`}>
      <Handle type="target" position={Position.Left} className="workflow-handle" />
      <div className="workflow-node-top"><span>{group}</span><em>{type}</em></div>
      <strong>{title}</strong>
      <p>{type === 'start' ? '流程入口' : type === 'end' ? '流程收口' : type === 'command' ? '执行命令 / 测试 / 构建' : type === 'ai_task' ? '调用模型完成任务' : '模板节点，可配置执行策略'}</p>
      <Handle type="source" position={Position.Right} className="workflow-handle" />
    </div>
  );
}

export function WorkflowEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [current, setCurrent] = useState<Workflow>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNodeCard }), []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<Node>();
  const [selectedEdge, setSelectedEdge] = useState<Edge>();
  const [message, setMessage] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [nodeQuery, setNodeQuery] = useState('');
  const onConnect = useCallback((connection: Connection) => setEdges(existing => addEdge(makeWorkflowEdge(`edge-${Date.now()}`, connection.source || '', connection.target || ''), existing)), [setEdges]);
  const normalizeEdges = (loadedEdges: Edge[]) => loadedEdges.map(edge => {
    const kind = (edge.data as any)?.kind === 'error' || edge.label === '异常' ? 'error' : 'success';
    return { ...makeWorkflowEdge(edge.id, edge.source, edge.target, kind), ...edge, data: { ...(edge.data || {}), kind } };
  });
  const graph = useMemo(() => JSON.stringify({ nodes: nodes.map(n => ({ ...n, type: (n.data as any).node_type || n.type })), edges }, null, 2), [nodes, edges]);

  const visibleWorkflows = useMemo(() => projectId ? workflows.filter(w => w.project_id === projectId || !w.project_id) : workflows, [workflows, projectId]);
  const visibleNodeCatalog = useMemo(() => {
    const needle = nodeQuery.trim().toLowerCase();
    return nodeCatalog.filter(node => !needle || [node.label, node.group, node.type].some(value => value.toLowerCase().includes(needle)));
  }, [nodeQuery]);
  const groupedNodeCatalog = useMemo(() => {
    return visibleNodeCatalog.reduce<Record<string, typeof nodeCatalog>>((groups, node) => {
      groups[node.group] = [...(groups[node.group] || []), node];
      return groups;
    }, {});
  }, [visibleNodeCatalog]);

  const load = () => {
    workflowService.list().then(setWorkflows).catch(() => setMessage('流程列表加载失败'));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    projectService.list().then(projects => {
      const found = projects.find(p => p.id === projectId);
      setProject(found);
      if (found) setMessage(`已进入项目「${found.name}」的流程编排空间`);
    }).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (!projectId || workflows.length === 0 || current) return;
    const matched = workflows.find(w => w.project_id === projectId);
    if (matched) openWorkflow(matched);
  }, [projectId, workflows, current]);

  const openWorkflow = (workflow: Workflow) => {
    setCurrent(workflow);
    try {
      const parsed = JSON.parse(workflow.graph_json || '{}');
      const loadedNodes = parsed.nodes?.length ? parsed.nodes.map((node: Node) => ({ ...node, type: 'workflowNode' })) : initialNodes;
      setNodes(loadedNodes);
      setEdges(parsed.edges?.length ? normalizeEdges(parsed.edges) : initialEdges);
      setMessage(`已打开流程：${workflow.name}`);
    } catch {
      setMessage('流程 JSON 解析失败，已使用默认画布。');
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  };

  const save = async () => {
    const payload = {
      project_id: projectId || current?.project_id,
      name: current?.name || `${project?.name || '默认企业级'}流程`,
      description: project ? `项目「${project.name}」的上线流程` : 'V0.1 workflow',
      graph_json: graph,
      status: 'ready',
      version: 1,
      is_template: false
    };
    const workflow = current ? await workflowService.update(current.id, { ...current, ...payload }) : await workflowService.create(payload);
    setCurrent(workflow);
    setMessage('流程已保存，可立即校验或运行。');
    load();
    return workflow;
  };

  const run = async () => {
    const workflow = current || await save();
    if (workflow?.id) workflowService.run(workflow.id).then(() => setMessage('流程已启动，查看底部实时日志和运行任务页。'));
  };

  const addNode = (type: string) => {
    const template = nodeCatalog.find(node => node.type === type);
    setNodes(existing => [...existing, {
      id: `${type}-${Date.now()}`,
      type: 'workflowNode',
      position: { x: 180 + existing.length * 35, y: 280 + existing.length * 20 },
      data: { label: template?.label || type, node_type: type, config: type === 'command' ? { command: 'pwd', cwd: project?.local_path || '.' } : (template?.config || {}) }
    }]);
  };

  return (
    <div className={`page workflow-page ${focusMode ? 'workflow-focus' : ''}`}>
      <div className="page-head workflow-head">
        <div>
          <button className="link-button" onClick={() => navigate('/projects')}>← 返回项目</button>
          <h1>流程编辑器{project ? ` · ${project.name}` : ''}</h1>
          <p>{project ? project.local_path : '拖拽节点、连线、编辑配置，保存后可运行。'}</p>
        </div>
        <div className="toolbar">
          <Button onClick={save}><Save size={16} />保存</Button>
          <Button variant="secondary" onClick={async () => { const workflow = current || await save(); const v = await workflowService.validate(workflow.id); setMessage(v.valid ? '校验通过：流程结构可运行' : v.errors.join('; ')); }}><CheckCircle size={16} />校验</Button>
          <Button onClick={run}><Play size={16} />运行</Button>
          <Button variant="secondary" onClick={() => setFocusMode(!focusMode)}>{focusMode ? <Minimize2 size={16} /> : <Expand size={16} />}{focusMode ? '退出专注' : '放大画布'}</Button>
          <Button variant="ghost"><Upload size={16} />导入</Button>
          <Button variant="ghost"><Download size={16} />导出</Button>
        </div>
      </div>
      <div className="workflow-grid workflow-grid-max">
        <Card className="node-palette">
          <h2><Plus size={16} />节点面板</h2>
          <label className="node-search"><Search size={15} /><Input placeholder="搜索节点" value={nodeQuery} onChange={e => setNodeQuery(e.target.value)} /></label>
          <div className="node-catalog">
            {Object.entries(groupedNodeCatalog).map(([group, groupNodes]) => (
              <section className="node-group" key={group}>
                <div className="node-group-title"><span>{group}</span><em>{groupNodes.length}</em></div>
                {groupNodes.map(node => <button key={node.type} onClick={() => addNode(node.type)}><span><strong>{node.label}</strong><small>{node.type}</small></span><em>添加</em></button>)}
              </section>
            ))}
            {visibleNodeCatalog.length === 0 && <div className="empty compact-empty">没有匹配节点</div>}
          </div>
          <h2>工作流</h2>
          <select className="input" value={current?.id || ''} onChange={event => { const workflow = workflows.find(w => w.id === event.target.value); if (workflow) openWorkflow(workflow); else { setCurrent(undefined); setNodes(initialNodes); setEdges(initialEdges); } }}>
            <option value="">新流程</option>
            {visibleWorkflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {project && <p className="form-hint">从项目页进入时，保存会自动绑定当前项目。</p>}
        </Card>
        <div className="flow-canvas">
          <div className="canvas-guide">
            <strong>流程画布</strong>
            <span>绿色箭头=成功路径</span>
            <span>红色箭头=异常兜底</span>
          </div>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => { setSelected(node); setSelectedEdge(undefined); }} onEdgeClick={(_, edge) => { setSelectedEdge(edge); setSelected(undefined); }} fitView>
            <Background /><MiniMap pannable zoomable /><Controls />
          </ReactFlow>
        </div>
      </div>

      {(selected || selectedEdge) && <div className="property-modal-backdrop" onClick={() => { setSelected(undefined); setSelectedEdge(undefined); }}>
        <Card className="property-modal" onClick={event => event.stopPropagation()}>
          <div className="property-modal-head">
            <h2>{selected ? '节点属性' : '连接属性'}</h2>
            <button aria-label="关闭属性弹窗" onClick={() => { setSelected(undefined); setSelectedEdge(undefined); }}>关闭</button>
          </div>
          {selected ? <>
            <label>节点 ID<Input value={selected.id} readOnly /></label>
            <label>节点类型<Input value={(selected.data as any).node_type || ''} readOnly /></label>
            <label>标签<Input value={String(selected.data.label || '')} onChange={e => setNodes(existing => existing.map(n => n.id === selected.id ? { ...n, data: { ...n.data, label: e.target.value } } : n))} /></label>
            <label>配置 JSON<Textarea value={JSON.stringify((selected.data as any).config || {}, null, 2)} onChange={e => { try { const config = JSON.parse(e.target.value); setNodes(existing => existing.map(n => n.id === selected.id ? { ...n, data: { ...n.data, config } } : n)); } catch { setMessage('配置 JSON 暂未合法，修正后会自动写入。'); } }} /></label>
          </> : selectedEdge ? <>
            <label>连接 ID<Input value={selectedEdge.id} readOnly /></label>
            <label>连接类型
              <select className="input" value={String((selectedEdge.data as any)?.kind || 'success')} onChange={e => {
                const kind = e.target.value === 'error' ? 'error' : 'success';
                setEdges(existing => existing.map(edge => edge.id === selectedEdge.id ? { ...makeWorkflowEdge(edge.id, edge.source, edge.target, kind), data: { ...(edge.data || {}), kind } } : edge));
                setSelectedEdge(existing => existing ? { ...makeWorkflowEdge(existing.id, existing.source, existing.target, kind), data: { ...(existing.data || {}), kind } } : existing);
              }}>
                <option value="success">成功连接：节点成功后继续</option>
                <option value="error">异常连接：节点失败后兜底</option>
              </select>
            </label>
            <p className="form-hint">绿色箭头表示正常执行顺序；红色异常箭头表示当前节点失败时进入的错误处理分支。</p>
          </> : null}
          <p className="notice">{message}</p>
        </Card>
      </div>}
    </div>
  );
}
