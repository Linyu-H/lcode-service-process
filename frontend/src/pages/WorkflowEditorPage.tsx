import { useCallback, useEffect, useMemo, useState } from 'react';
import { addEdge, Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Connection, type Node } from '@xyflow/react';
import { Save, Play, CheckCircle, Download, Upload } from 'lucide-react';
import { workflowService } from '../services/workflows';
import type { Workflow } from '../types/workflow';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';

const initialNodes: Node[] = [
  { id: 'start', type: 'input', position: { x: 80, y: 120 }, data: { label: '开始节点', node_type: 'start', config: {} } },
  { id: 'ai-task', position: { x: 360, y: 120 }, data: { label: 'AI 任务节点', node_type: 'ai_task', config: { prompt: '请总结项目目标' } } },
  { id: 'command', position: { x: 640, y: 120 }, data: { label: '命令节点', node_type: 'command', config: { command: 'pwd', cwd: '.' } } },
  { id: 'end', type: 'output', position: { x: 920, y: 120 }, data: { label: '结束节点', node_type: 'end', config: {} } }
];
const initialEdges = [
  { id: 'e1', source: 'start', target: 'ai-task' },
  { id: 'e2', source: 'ai-task', target: 'command' },
  { id: 'e3', source: 'command', target: 'end' }
];

export function WorkflowEditorPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [current, setCurrent] = useState<Workflow>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<Node>();
  const [message, setMessage] = useState('');
  const onConnect = useCallback((connection: Connection) => setEdges(existing => addEdge(connection, existing)), [setEdges]);
  const graph = useMemo(() => JSON.stringify({ nodes: nodes.map(n => ({ ...n, type: (n.data as any).node_type || n.type })), edges }, null, 2), [nodes, edges]);

  const load = () => {
    workflowService.list().then(setWorkflows).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = { name: current?.name || '默认企业级流程', description: 'V0.1 workflow', graph_json: graph, status: 'ready', version: 1, is_template: false };
    const workflow = current ? await workflowService.update(current.id, { ...current, ...payload }) : await workflowService.create(payload);
    setCurrent(workflow);
    setMessage('流程已保存');
    load();
    return workflow;
  };

  const run = async () => {
    const workflow = current || await save();
    if (workflow?.id) {
      workflowService.run(workflow.id).then(() => setMessage('流程已启动，查看底部实时日志和运行任务页'));
    }
  };

  return (
    <div className="page workflow-page">
      <div className="page-head">
        <div><h1>流程编辑器</h1><p>拖拽节点、连线、编辑配置，保存后可运行。</p></div>
        <div className="toolbar">
          <Button onClick={save}><Save size={16} />保存</Button>
          <Button variant="secondary" onClick={() => current && workflowService.validate(current.id).then(v => setMessage(v.valid ? '校验通过' : v.errors.join('; ')))}><CheckCircle size={16} />校验</Button>
          <Button onClick={run}><Play size={16} />运行</Button>
          <Button variant="ghost"><Upload size={16} />导入</Button>
          <Button variant="ghost"><Download size={16} />导出</Button>
        </div>
      </div>
      <div className="workflow-grid">
        <Card className="node-palette">
          <h2>节点面板</h2>
          {['start', 'ai_task', 'command', 'manual_confirm', 'end'].map(type => (
            <button key={type} onClick={() => setNodes(existing => [...existing, { id: `${type}-${Date.now()}`, position: { x: 120, y: 240 }, data: { label: type, node_type: type, config: {} } }])}>{type}</button>
          ))}
          <h2>工作流</h2>
          <select className="input" onChange={event => {
            const workflow = workflows.find(w => w.id === event.target.value);
            if (workflow) {
              setCurrent(workflow);
              const parsed = JSON.parse(workflow.graph_json);
              setNodes(parsed.nodes);
              setEdges(parsed.edges);
            }
          }}>
            <option>新流程</option>
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Card>
        <div className="flow-canvas">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelected(node)} fitView>
            <Background /><MiniMap /><Controls />
          </ReactFlow>
        </div>
        <Card className="properties">
          <h2>属性面板</h2>
          {selected ? <>
            <label>节点 ID<Input value={selected.id} readOnly /></label>
            <label>节点类型<Input value={(selected.data as any).node_type || ''} readOnly /></label>
            <label>标签<Input value={String(selected.data.label || '')} onChange={e => setNodes(existing => existing.map(n => n.id === selected.id ? { ...n, data: { ...n.data, label: e.target.value } } : n))} /></label>
            <label>配置 JSON<Textarea value={JSON.stringify((selected.data as any).config || {}, null, 2)} onChange={e => {
              try {
                const config = JSON.parse(e.target.value);
                setNodes(existing => existing.map(n => n.id === selected.id ? { ...n, data: { ...n.data, config } } : n));
              } catch {}
            }} /></label>
          </> : <p className="muted">选择节点后编辑属性。</p>}
          <p className="notice">{message}</p>
        </Card>
      </div>
    </div>
  );
}
