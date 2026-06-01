from __future__ import annotations
from app.nodes.start import StartNode
from app.nodes.ai_task import AITaskNode
from app.nodes.command import CommandNode
from app.nodes.manual_confirm import ManualConfirmNode
from app.nodes.end import EndNode

class NodeRegistry:
    def __init__(self):
        self.nodes = {n.node_type: n for n in [StartNode(), AITaskNode(), CommandNode(), ManualConfirmNode(), EndNode()]}
    def get(self, node_type: str):
        return self.nodes.get(node_type)
    def templates(self):
        return [
            {"node_type":"start","name":"开始节点","category":"system","description":"定义流程输入与项目基础信息","executable":True},
            {"node_type":"ai_task","name":"AI 任务节点","category":"system","description":"调用配置模型完成任务","executable":True},
            {"node_type":"command","name":"命令执行节点","category":"system","description":"在安全策略下执行命令","executable":True},
            {"node_type":"manual_confirm","name":"人工确认节点","category":"system","description":"暂停流程等待确认","executable":True},
            {"node_type":"end","name":"结束节点","category":"system","description":"汇总流程输出","executable":True},
            *[
                {"node_type": k, "name": v, "category": "enterprise_reserved", "description": "企业版预留节点模板", "executable": False}
                for k, v in {
                    "requirement": "需求澄清节点",
                    "architecture": "技术架构节点",
                    "test": "测试节点",
                    "build": "构建打包节点",
                    "deploy": "部署节点",
                    "http": "HTTP 请求节点",
                    "file": "文件操作节点",
                    "skill": "Skill 节点",
                    "mcp": "MCP 配置节点",
                }.items()
            ],
        ]
node_registry = NodeRegistry()
