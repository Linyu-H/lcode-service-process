from __future__ import annotations
from app.nodes.start import StartNode
from app.nodes.ai_task import AITaskNode
from app.nodes.command import CommandNode
from app.nodes.manual_confirm import ManualConfirmNode
from app.nodes.end import EndNode

EXECUTABLE_TEMPLATES = [
    ("start", "开始节点", "基础", "定义流程输入、项目目标、技术栈和自动化策略", {"auto_mode": True}),
    ("ai_task", "AI 任务节点", "AI", "调用已配置模型完成分析、生成、审查或总结任务", {"prompt": "请根据项目上下文完成当前任务"}),
    ("command", "命令执行节点", "工具", "在安全策略下执行本地命令并记录 stdout/stderr", {"command": "pwd", "cwd": "."}),
    ("manual_confirm", "人工确认节点", "控制", "暂停流程，等待用户确认高风险操作或关键决策", {"reason": "请确认下一步操作"}),
    ("end", "结束节点", "基础", "汇总流程输出、测试结果、构建结果和后续建议", {}),
]

RESERVED_TEMPLATES = [
    ("requirement", "需求澄清节点", "产品", "收集业务目标、约束条件、用户画像和验收标准", {"questions": [], "output": "requirements.md"}),
    ("product_design", "产品设计节点", "产品", "生成 PRD、信息架构、页面清单和核心交互说明", {"deliverable": "prd.md"}),
    ("architecture", "技术架构节点", "研发", "输出技术选型、模块边界、接口设计和数据结构", {"output": "architecture.md"}),
    ("ui_design", "UI 设计节点", "研发", "生成页面视觉规范、组件层级、主题与可访问性要求", {"style": "cursor-like professional"}),
    ("code_generation", "代码生成节点", "AI", "根据上下文生成或修改项目代码，并记录文件变更", {"target": "frontend/backend", "allow_write": True}),
    ("test", "测试验证节点", "质量", "运行 typecheck、单测、构建或用户配置的验证命令", {"command": "npm run typecheck && npm run build", "cwd": "."}),
    ("auto_fix", "自动修复节点", "质量", "根据错误日志循环分析并尝试修复，限制最大轮次", {"max_rounds": 3}),
    ("build", "构建打包节点", "交付", "执行前端、后端或 Electron 构建打包流程", {"command": "npm run build"}),
    ("git_commit", "Git 提交节点", "交付", "生成变更摘要并创建 Git commit，高风险操作需确认", {"message": "chore: workflow checkpoint", "require_confirmation": True}),
    ("deploy", "部署节点", "交付", "向预配置服务器或环境部署构建产物", {"target": "staging", "require_confirmation": True}),
    ("file_operation", "文件操作节点", "工具", "读取、写入、diff 或回滚项目文件", {"operation": "read/write/diff"}),
    ("http_request", "HTTP 请求节点", "工具", "调用外部 HTTP API 并把响应传给下游节点", {"method": "GET", "url": ""}),
    ("mcp", "MCP 工具节点", "工具", "调用已配置 MCP Server 的工具能力", {"server": "", "tool": ""}),
    ("skill", "Skill 节点", "AI", "调用预置 Skill 完成专业子任务", {"skill": ""}),
    ("condition", "条件分支节点", "控制", "根据表达式选择不同下游路径", {"expression": "status == success"}),
    ("parallel", "并行执行节点", "控制", "并行触发多个下游分支并汇总结果", {"strategy": "all"}),
    ("loop", "循环节点", "控制", "按条件或次数重复执行子流程", {"max_iterations": 3}),
    ("data_transform", "数据转换节点", "工具", "对 JSON、文本或上游输出做格式转换", {"format": "json"}),
    ("doc_generation", "文档生成节点", "交付", "生成 README、测试说明、上线说明和变更报告", {"target": "README.md"}),
]


def _schema(node_type: str) -> dict:
    return {
        "type": "object",
        "title": node_type,
        "properties": {
            "description": {"type": "string"},
            "require_confirmation": {"type": "boolean"},
        },
    }


class NodeRegistry:
    def __init__(self):
        self.nodes = {n.node_type: n for n in [StartNode(), AITaskNode(), CommandNode(), ManualConfirmNode(), EndNode()]}

    def get(self, node_type: str):
        return self.nodes.get(node_type)

    def templates(self):
        executable = [
            {
                "node_type": node_type,
                "name": name,
                "category": category,
                "description": description,
                "schema_json": __import__("json").dumps(_schema(node_type), ensure_ascii=False),
                "default_config_json": __import__("json").dumps(config, ensure_ascii=False),
                "executable": True,
            }
            for node_type, name, category, description, config in EXECUTABLE_TEMPLATES
        ]
        reserved = [
            {
                "node_type": node_type,
                "name": name,
                "category": category,
                "description": description + "（当前为模板，后续接入执行器）",
                "schema_json": __import__("json").dumps(_schema(node_type), ensure_ascii=False),
                "default_config_json": __import__("json").dumps(config, ensure_ascii=False),
                "executable": False,
            }
            for node_type, name, category, description, config in RESERVED_TEMPLATES
        ]
        return executable + reserved


node_registry = NodeRegistry()
