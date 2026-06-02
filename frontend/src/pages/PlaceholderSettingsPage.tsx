import { CheckCircle, Database, GitBranch, Globe, KeyRound, Network, Save, Server, Shield, SlidersHorizontal, Terminal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

type Preset = {
  title: string;
  description: string;
  icon: typeof Network;
  fields: string[];
  examples: string[];
};

const presets: Record<string, Preset> = {
  'MCP 配置': {
    title: 'MCP Server 接入',
    description: '管理本地或远程 MCP 工具服务，后续可被流程节点调用并进入审计日志。',
    icon: Network,
    fields: ['服务名称', '启动命令 / URL', '允许工具白名单', '环境变量'],
    examples: ['filesystem MCP', 'browser automation MCP', 'database MCP']
  },
  '代理配置': {
    title: '网络代理与模型访问',
    description: '为 AI Provider、MCP Server 和命令节点预留 HTTP/SOCKS 代理策略。',
    icon: SlidersHorizontal,
    fields: ['代理名称', '代理地址', '适用范围', '认证 Token'],
    examples: ['HTTP 127.0.0.1:7890', 'SOCKS5 127.0.0.1:7891', '仅模型请求启用']
  },
  'Git 配置': {
    title: 'Git 仓库与交付策略',
    description: '配置默认 Git 用户、远程仓库、提交策略和高风险 push 确认策略。',
    icon: GitBranch,
    fields: ['Git 用户名', 'Git 邮箱', '默认远程仓库', '提交策略'],
    examples: ['自动生成阶段性 commit', 'push 前二次确认', '失败后保留 diff']
  },
  '服务器配置': {
    title: '远程服务器与部署目标',
    description: '预留 SSH、Docker、云服务器和上线环境配置，支撑后续部署节点。',
    icon: Server,
    fields: ['服务器别名', 'Host / IP', 'SSH 用户', '部署目录'],
    examples: ['staging', 'production', 'Docker host']
  }
};

export function PlaceholderSettingsPage({ title }: { title: string }) {
  const preset = presets[title] || presets['MCP 配置'];
  const Icon = preset.icon;

  return (
    <div className="page settings-page">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{preset.description}</p>
        </div>
        <Button variant="secondary"><CheckCircle size={16} />连接校验</Button>
      </div>

      <div className="settings-grid">
        <Card className="settings-hero-card">
          <div className="settings-hero-icon"><Icon size={24} /></div>
          <h2>{preset.title}</h2>
          <p>当前为企业版增强能力的上线占位页：先把信息架构、输入项、风险提示和保存入口做完整，后续接入真实 API 时不会破坏主界面。</p>
          <div className="settings-pills">
            {preset.examples.map(item => <span key={item}>{item}</span>)}
          </div>
        </Card>

        <Card>
          <h2><Save size={16} />基础配置</h2>
          {preset.fields.map((field, index) => (
            <label key={field}>{field}<Input placeholder={index === 1 ? 'URL / Host / Command' : field} /></label>
          ))}
          <label>备注 / 安全说明<Textarea placeholder="记录用途、权限范围、上线注意事项。敏感信息后续会加密保存。" /></label>
          <div className="toolbar"><Button><Save size={16} />保存配置</Button><Button variant="ghost">重置</Button></div>
        </Card>

        <Card>
          <h2><Shield size={16} />上线前检查</h2>
          <div className="check-list">
            <span><KeyRound size={15} />敏感字段不明文展示</span>
            <span><Terminal size={15} />高风险命令需要确认</span>
            <span><Database size={15} />配置变更写入审计日志</span>
            <span><Globe size={15} />连接失败给出可恢复提示</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
