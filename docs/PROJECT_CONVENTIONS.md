已经完成：后端 API + 前端界面 + 虚拟环境 + 环境变量管理），
**v3.0 版本**，让它和现在的代码结构完全对齐。

---


# AI 深度研究助手 - 项目宪法 (v3.0)

本文件记录项目的所有架构决策、命名规范和路径规则。**任何变更必须先更新此文档再写代码。**

---

## 1. 项目目录结构（当前实际结构）

```
AI_Deep_Research_Kit/
├── backend/                        # Python 后端服务
│   ├── app/
│   │   ├── api/                    # FastAPI 路由层
│   │   │   └── research.py         # POST /api/v1/research
│   │   ├── agent/                  # DeepAgents 核心
│   │   │   ├── executor.py         # Agent 单例创建
│   │   │   └── tools.py            # 自定义工具（internet_search）
│   │   ├── models/                 # Pydantic 数据模型
│   │   │   └── request_response.py # ResearchRequest / ResearchResponse
│   │   ├── utils/                  # 工具函数
│   │   │   └── config.py           # 统一配置加载（读取 .env）
│   │   └── main.py                 # FastAPI 应用入口（含 CORS）
│   ├── .env                        # 环境变量（禁止提交）
│   ├── .venv/                      # 虚拟环境（禁止提交）
│   └── requirements.txt            # 依赖列表（锁定版本）
├── frontend/                       # React 前端界面
│   ├── src/
│   │   ├── App.jsx                 # 主界面组件
│   │   └── index.css               # TailwindCSS 入口
│   ├── index.html                  # 页面模板
│   ├── package.json                # 依赖清单
│   ├── vite.config.js              # Vite 配置（含 TailwindCSS 插件）
│   └── node_modules/               # 前端依赖（禁止提交）
├── docs/
│   └── PROJECT_CONVENTIONS.md      # 本文件
├── .gitignore
└── docker-compose.yml              # 待添加
```

---

## 2. 命名规范（强制）

| 类型 | 规范 | 示例 |
| :--- | :--- | :--- |
| Python 文件名 | `snake_case` | `agent_executor.py`, `search_tools.py` |
| Python 类名 | `PascalCase` | `ResearchAgent`, `Config` |
| Python 函数/变量 | `snake_case` | `get_report()`, `search_query` |
| 前端组件 | `PascalCase` | `App.jsx`, `ResearchDashboard.jsx` |
| 前端文件名 | `PascalCase` 或 `camelCase` | `App.jsx`, `api.js` |

---

## 3. 路径与导入规范（绝对禁止硬编码）

- **禁止**：代码中任何地方出现 `C:/`、`E:/` 或 `os.chdir()`。
- **必须**：所有路径基于 `Path(__file__).resolve().parent` 动态计算。
- **导入**：后端内部导入一律从 `app.xxx` 开始（绝对导入）。

*正确示例（在 `backend/app/utils/config.py` 中）：*
```python
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # 回到项目根目录
```

---

## 4. 环境变量配置规范

所有密钥存放在 `backend/.env` 中，通过 `backend/app/utils/config.py` 的 `Config` 类统一读取。

**当前必需变量：**
| 变量名 | 用途 | 示例 |
| :--- | :--- | :--- |
| `SILICONFLOW_API_KEY` | 硅基流动大模型 | `sk-xxx` |
| `TAVILY_API_KEY` | Tavily 联网搜索 | `tvly-xxx` |
| `MODEL_NAME` | 模型名称（可选） | `deepseek-ai/DeepSeek-V4-Pro` |
| `LANGSMITH_API_KEY` | 调试追踪（可选） | `lsv2_pt_xxx` |
| `LANGSMITH_TRACING` | 是否开启追踪（可选） | `true` / `false` |

**新增环境变量时，必须同步更新：**
- `Config` 类（`backend/app/utils/config.py`）
- 本宪法文档

---

## 5. 依赖管理规范

- 所有依赖必须安装在 `backend/.venv` 虚拟环境中。
- 运行任何 Python 命令前，必须确保终端前缀显示 `(.venv)`。
- 新增库后必须执行：
  
  ```bash
  pip freeze > requirements.txt
  ```
- 前端依赖由 `package.json` 管理，新增库时使用 `npm install --save <包名>`。

---

## 6. API 规范（已实施）

### 基本信息
- **根路径**：`http://127.0.0.1:8000`
- **API 前缀**：`/api/v1`
- **交互文档**：`/docs`（Swagger UI，自动生成）
- **前端地址**：`http://localhost:5173`

### 端点定义

| 方法 | 路径 | 功能 | 请求体 | 响应体 |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/research` | 执行研究任务 | `{"query": "用户问题"}` | `{"status": "success", "data": "回答内容", "duration_seconds": 12.34}` |
| `GET` | `/` | 健康检查 | 无 | `{"message": "...", "docs": "/docs"}` |

### 数据模型（Pydantic）
- **请求模型**：`ResearchRequest`（字段：`query: str`）
- **响应模型**：`ResearchResponse`（字段：`status`, `data`, `duration_seconds`）

### 错误处理
- 所有异常统一返回 HTTP 500，响应体包含 `detail` 字段。
- 服务端日志会打印详细错误信息，便于调试。

---

## 7. 前后端协作规范

### 后端（FastAPI）
- 已配置 CORS 中间件，允许所有来源（`allow_origins=["*"]`），便于开发调试。
- 生产环境部署时，将 `allow_origins` 改为具体前端域名。

### 前端（React + Vite）
- 通过 Axios 调用后端 API：`axios.post('http://127.0.0.1:8000/api/v1/research', { query })`
- 已集成 TailwindCSS，样式通过 `className` 控制，不使用自定义 CSS 文件。

### 启动顺序
1. 先启动后端：`uvicorn app.main:app --reload`
2. 再启动前端：`npm run dev`

---

## 8. 提交与版本控制规范

- 每次提交前，确保项目可以正常运行（`uvicorn app.main:app` 无报错，前端 `npm run dev` 可访问）。
- 提交信息格式：`<类型>: <简短描述>`
  - 示例：`feat: 增加流式输出功能`、`fix: 修复 Tavily 搜索超时问题`、`docs: 更新项目宪法至 v3.0`
- **禁止提交**：
  - `.env` 文件（已在 `.gitignore` 中排除）
  - `.venv/` 和 `node_modules/` 文件夹（已在 `.gitignore` 中排除）

---

## 9. 当前已实现功能清单

| 模块 | 状态 | 说明 |
| :--- | :--- | :--- |
| 后端 FastAPI 服务 | ✅ 已完成 | 支持 `/api/v1/research` 接口 |
| DeepAgents Agent | ✅ 已完成 | 集成 Tavily 搜索 + DeepSeek 模型 |
| 环境变量管理 | ✅ 已完成 | 通过 `Config` 类统一读取 `.env` |
| 虚拟环境 | ✅ 已完成 | `backend/.venv` 隔离 Python 依赖 |
| 前端 React 界面 | ✅ 已完成 | 聊天式交互，支持输入/输出/耗时显示 |
| CORS 跨域配置 | ✅ 已完成 | 允许前端 `localhost:5173` 访问 |
| TailwindCSS 样式 | ✅ 已完成 | 响应式界面，统一设计语言 |

---

## 10. 待实现功能（规划中）

| 功能 | 优先级 | 说明 |
| :--- | :--- | :--- |
| 流式输出（SSE） | 高 | 实现打字机效果，提升用户体验 |
| 对话历史记录 | 中 | 使用 SQLite 存储每次问答 |
| 任务看板可视化 | 中 | 显示 Agent 的 `write_todos` 清单 |
| 部署到云端 | 中 | 前端部署到 Vercel / Netlify，后端部署到 Railway |
| 文档导出 | 低 | 支持将报告导出为 Markdown / PDF |

---

## 附录：常用命令速查

| 场景 | 命令 |
| :--- | :--- |
| 激活虚拟环境 | `cd backend && .venv\Scripts\activate` |
| 启动后端 | `uvicorn app.main:app --reload` |
| 启动前端 | `cd frontend && npm run dev` |
| 更新 Python 依赖 | `pip freeze > requirements.txt` |
| 安装前端新包 | `npm install --save <包名>` |
```

---


---

现在你的宪法文档已经和项目完全同步了。你可以把它提交到 Git，也可以先放着，等我们开发新功能时再同步更新。
