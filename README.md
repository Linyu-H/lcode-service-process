# Lcode Service Process

Lcode Service Process 是一个企业级桌面端 AI Agent 工作流编排应用雏形，基于 Electron + React + TypeScript + Python FastAPI + SQLite 构建。目标是让用户在本地配置 AI 服务商、创建项目、可视化编排流程、运行基础节点并查看实时日志与审计记录。

## 功能特性

- Electron 桌面端外壳，安全 preload API，关闭 Node.js renderer 全能力。
- React + TypeScript 管理后台式界面，深色专业开发工具风格。
- FastAPI 本地服务，默认监听 `127.0.0.1:8765`。
- SQLite 自动初始化，包含 AI、项目、工作流、运行、日志、安全策略等核心表。
- AI Provider / Model CRUD，API Key 使用 Fernet 本地加密保存并脱敏展示。
- 项目 CRUD，自动创建本地项目目录。
- React Flow 流程编辑器，支持节点、连线、配置 JSON、保存、校验、运行。
- 节点库，内置 Start / AI Task / Command / Manual Confirm / End，并预留企业节点。
- 基础工作流执行引擎，顺序 DAG 执行，记录 workflow_run / node_run。
- 命令执行工具，包含危险命令检测与拦截。
- 文件读写服务与文件变更记录。
- WebSocket 实时事件推送：`/ws/events`、`/ws/runs/{run_id}`。
- 执行日志页面：操作、AI 请求、命令、文件变更。
- MCP、代理、Git、服务器配置页面骨架，预留后续企业版扩展。

## 技术栈

- 桌面端：Electron
- 前端：React、TypeScript、Vite、React Router、Zustand、React Flow、Lucide Icons
- 后端：Python 3.11+、FastAPI、SQLAlchemy 2.x、Pydantic v2、SQLite、httpx、cryptography
- 实时通信：FastAPI WebSocket
- 数据库：SQLite 自动建表

## 目录结构

```text
backend/              FastAPI 本地服务
electron/             Electron main / preload
frontend/src/         React TypeScript 前端
frontend/src/pages/   Dashboard、项目、流程、节点、运行、日志、设置页面
frontend/src/services API 与 WebSocket 封装
任务.md               原始企业级实现任务说明
```

## 环境要求

- macOS / Windows / Linux 桌面环境
- Python 3.11+
- Node.js 20+ 推荐
- npm

## 安装依赖

```bash
python3.11 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
npm install
```

## 启动后端

```bash
cd backend
python3.11 -m uvicorn app.main:app --host 127.0.0.1 --port 8765 --reload
```

健康检查：

```bash
curl http://127.0.0.1:8765/health
```

## 启动前端

```bash
npm run dev:frontend
```

打开：`http://127.0.0.1:5173`

## 启动 Electron

开发模式建议分别启动后端和前端后执行：

```bash
npm run dev:electron
```

也可以使用一键开发命令：

```bash
npm run dev
```

## 配置 AI Provider

1. 打开「AI 模型配置」。
2. 新增服务商，填写名称、OpenAI Compatible Base URL、API Key。
3. 新增模型并绑定服务商。
4. 设置模型角色，例如 `coding`、`planning`、`review`。

> 不配置 API Key 时应用仍可启动；AI 节点运行会返回明确错误，不会导致应用崩溃。

## 创建项目和流程

1. 打开「项目管理」，填写名称和本地路径，创建项目。
2. 打开「流程编辑器」。
3. 使用默认 Start → AI Task → Command → End 流程，或从节点面板新增节点。
4. 点击节点编辑右侧配置 JSON。
5. 点击「保存」。
6. 点击「校验」。

## 运行流程

1. 在「流程编辑器」点击「运行」。
2. 查看底部实时事件面板。
3. 打开「运行任务」查看运行状态和进度。
4. 打开「执行日志」查看命令、文件变更与审计记录。

## 安全策略说明

命令执行默认检测并拦截以下危险操作：

- `rm -rf /`、`rm -rf ~` 等危险删除
- `sudo`
- `chmod -R 777`
- `chown -R`
- `mkfs`
- `dd if=`
- fork bomb
- `git push`
- `git reset --hard`
- `docker system prune`

风险等级：

- low：只读命令、读取文件等，可自动执行
- medium：安装依赖、修改项目文件等，后续由项目策略控制
- high：删除、覆盖配置、未知脚本等，必须确认
- critical：远程推送、部署、sudo、系统目录操作等，必须二次确认

## 测试与验证

后端：

```bash
python3.11 -m compileall backend/app
cd backend && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8765
curl http://127.0.0.1:8765/health
```

前端：

```bash
npm run typecheck
npm run build
```

手动验证路径：

1. 启动后端。
2. 启动前端或 Electron。
3. 打开首页。
4. 新建 AI Provider。
5. 新建项目。
6. 打开流程编辑器。
7. 添加开始、AI、命令、结束节点并连线。
8. 保存流程。
9. 运行流程。
10. 查看底部实时日志与运行记录。

## 常见问题

### AI 节点失败：未配置 API Key

这是预期行为。请在「AI 模型配置」中新增服务商并填写 API Key，再新增模型绑定服务商。

### Electron 无法启动后端

开发环境建议手动先运行后端：

```bash
npm run dev:backend
```

确认 `/health` 正常后再运行 Electron。

### npm install 很慢

可切换 npm registry 或使用本机已有包管理缓存。项目未锁定私有依赖。

## 后续路线图

### V0.2 节点体系增强

- 自定义节点
- 条件分支
- 并行执行
- 节点导入导出

### V0.3 安全与自动化增强

- 文件 diff 预览
- 文件回滚
- Git 快照
- 更强命令沙箱

### V0.4 MCP 与 Skill

- MCP Server 管理
- Skill Node
- 工具调用审计

### V0.5 打包与部署

- Electron Builder
- PyInstaller
- macOS 安装包
- 自动更新预留

### V1.0 企业版

- 团队协作
- 企业 RBAC
- 审计报表
- 云同步
- SSO
- 私有化部署
