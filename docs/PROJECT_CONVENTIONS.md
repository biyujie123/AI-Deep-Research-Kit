# AI 深度研究助手 - 项目宪法 (v4.0)

本文件记录项目的所有架构决策、命名规范和路径规则。**任何变更必须先更新此文档再写代码。**

---

## 1. 项目目录结构（当前实际结构）
AI_Deep_Research_Kit/
├── backend/ # Python 后端服务
│ ├── app/
│ │ ├── agent/ # DeepAgents 核心
│ │ │ ├── executor.py # Agent 单例创建
│ │ │ └── tools.py # 自定义工具（搜索、时间管理）
│ │ ├── api/ # FastAPI 路由层
│ │ │ ├── auth.py # 认证接口（登录/验证码）
│ │ │ ├── research.py # 研究对话接口
│ │ │ ├── research_stream.py # 流式研究接口
│ │ │ ├── timeline_api.py # 时间线查询接口
│ │ │ └── timer_api.py # 计时器状态接口
│ │ ├── models/ # 数据模型
│ │ │ ├── base.py # SQLAlchemy 共享 Base
│ │ │ ├── user.py # 用户模型
│ │ │ ├── request_response.py # Pydantic 请求/响应模型
│ │ │ └── timeline_models.py # 时间块/便签/计时器表
│ │ ├── utils/ # 工具函数
│ │ │ ├── config.py # 统一配置加载（读取 .env）
│ │ │ └── email.py # 邮件发送工具
│ │ └── main.py # FastAPI 应用入口（含 CORS）
│ ├── data/ # 数据库文件目录
│ │ └── timemgr.db # SQLite 数据库
│ ├── .env # 环境变量（禁止提交）
│ ├── .venv/ # 虚拟环境（禁止提交）
│ └── requirements.txt # 依赖列表（锁定版本）
├── frontend/ # React 前端界面
│ ├── src/
│ │ ├── components/ # 通用组件
│ │ │ ├── layouts/ # 布局组件（规划中）
│ │ │ ├── tabs/ # Tab 页面组件（规划中）
│ │ │ ├── timegrid/ # 时间块网格组件（规划中）
│ │ │ ├── MainApp.jsx # 主界面（原 App.jsx 内容）
│ │ │ └── TimeLineView.jsx # 今日时间线预览
│ │ ├── pages/ # 页面级组件
│ │ │ └── Login.jsx # 登录页面
│ │ ├── App.jsx # 路由配置 + 登录状态管理
│ │ ├── main.jsx # React 入口
│ │ └── index.css # TailwindCSS 入口
│ ├── index.html # 页面模板
│ ├── package.json # 前端依赖
│ ├── vite.config.js # Vite 配置（含 TailwindCSS）
│ └── node_modules/ # 前端依赖（禁止提交）
├── docs/
│ └── PROJECT_CONVENTIONS.md # 本文件
├── .gitignore
└── README.md

text

---

## 2. 命名规范（强制）

| 类型 | 规范 | 示例 |
| :--- | :--- | :--- |
| Python 文件名 | `snake_case` | `agent_executor.py`, `timeline_models.py` |
| Python 类名 | `PascalCase` | `ResearchAgent`, `TimeBlock` |
| Python 函数/变量 | `snake_case` | `get_report()`, `create_time_block` |
| React 组件文件名 | `PascalCase` | `MainApp.jsx`, `TimeLineView.jsx` |
| React 组件名 | `PascalCase` | `function MainApp()`, `function Login()` |
| 前端页面 | `PascalCase` | `Login.jsx`, `TimeBlockTab.jsx` |

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
所有密钥存放在 backend/.env 中，通过 backend/app/utils/config.py 的 Config 类统一读取。

当前必需变量：

|变量名	|用途	|示例|
|SILICONFLOW_API_KEY	|硅基流动大模型|	sk-xxx|
|TAVILY_API_KEY	Tavily| 联网搜索	|tvly-xxx|
MODEL_NAME	模型名称（可选）	deepseek-ai/DeepSeek-V4-Pro
MAIL_HOST	邮箱 SMTP 服务器	smtp.qq.com
MAIL_PORT	邮箱 SMTP 端口	587
MAIL_USERNAME	发件邮箱地址	xxx@qq.com
MAIL_PASSWORD	邮箱授权码	xxxxx
LANGSMITH_API_KEY	调试追踪（可选）	lsv2_pt_xxx
LANGSMITH_TRACING	是否开启追踪（可选）	true / false
新增环境变量时，必须同步更新：

Config 类（backend/app/utils/config.py）

本宪法文档
---


## 5. 依赖管理规范
所有依赖必须安装在 backend/.venv 虚拟环境中。

运行任何 Python 命令前，必须确保终端前缀显示 (.venv)。

新增库后必须执行：

bash
pip freeze > requirements.txt
前端依赖由 package.json 管理，新增库时使用 npm install --save <包名>。
---

## 6. API 规范（已实施）
基本信息
根路径：http://127.0.0.1:8000

API 前缀：/api/v1

认证前缀：/auth

交互文档：/docs（Swagger UI，自动生成）

前端地址：http://localhost:5173

认证接口（/auth）
方法	路径	功能	请求体	响应体
POST	/auth/send-otp	发送邮箱验证码	{"email": "xxx@qq.com"}	{"message": "...", "debug_otp": "123456"}
POST	/auth/login	验证码登录	{"email": "xxx@qq.com", "otp": "123456"}	{"access_token": "...", "token_type": "bearer"}
业务接口（/api/v1）
方法	路径	功能	请求体	响应体
POST	/api/v1/research	执行研究任务	{"query": "用户问题"}	{"status": "success", "data": "回答内容", "duration_seconds": 12.34}
GET	/api/v1/timeline/today	获取今日时间线	无（需 JWT）	{"date": "...", "blocks": [...], "memos": [...]}
GET	/api/v1/timer/status	获取计时器状态	无（需 JWT）	{"is_running": true, "total": 1200, "elapsed": 300}
数据模型（Pydantic）
请求模型：ResearchRequest（字段：query: str）

响应模型：ResearchResponse（字段：status, data, duration_seconds）

错误处理
所有异常统一返回 HTTP 500 或 400，响应体包含 detail 字段。

服务端日志会打印详细错误信息，便于调试。
---
## 7. 用户认证与数据隔离规范
### 7.1 认证方式
使用 JWT Token（Bearer Token）进行用户认证。

Token 在登录成功后由后端生成，前端存储在 localStorage 中。

每次请求在 Authorization 头中携带：Authorization: Bearer <token>
---
### 7.2 用户表结构
python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    is_active = Column(Boolean, default=True)
---
### 7.3 数据隔离原则
所有业务表（time_blocks、memos、timer_records）必须包含 user_id 字段。

所有数据查询必须过滤 user_id = current_user.id。

所有数据写入必须设置 user_id = current_user.id。

---
### 7.4 前端路由守卫
未登录用户访问 / 自动跳转到 /login。

已登录用户访问 /login 自动跳转到 /。

Token 过期或无效时自动跳转到登录页。
---
## 8. 数据库规范
### 8.1 数据库类型
使用 SQLite 作为开发数据库。

数据库文件位置：backend/data/timemgr.db
---
### 8.2 模型共享 Base
所有模型必须继承自 app.models.base.Base（共享 Base），避免循环导入。

表创建在 timeline_models.py 中通过 Base.metadata.create_all(bind=engine) 执行。
---
### 8.3 当前表结构
表名	用途	关键字段
users	用户信息	id, email, created_at
time_blocks	时间块（日程）	id, user_id, title, date, start_time, end_time, color
memos	便签/备忘录	id, user_id, content, remind_at, is_done
timer_records	计时器记录	id, user_id, duration_minutes, timer_type, is_completed

---
## 9. 时间块功能规划（Phase 2）
### 9.1 核心交互
时间网格：以 30 分钟为粒度，展示 8:00-22:00 的时间块。

创建：点击空白格子弹出弹窗，填写标题后创建。

拖拽调整：拖动时间块上/下边缘调整起止时间。

编辑/删除：点击时间块弹出操作菜单。

---

### 9.2 数据格式
date：日期字符串 YYYY-MM-DD

start_time：开始时间 HH:MM

end_time：结束时间 HH:MM

color：颜色代码（如 #4F46E5）
---

### 9.3 AI Agent 集成预留
新增工具 update_time_block，支持通过对话修改时间块。

前端使用全局状态管理（Context），确保 Agent 修改后 UI 自动刷新。
---

## 10. 前后端协作规范
后端（FastAPI）
已配置 CORS 中间件，允许所有来源（allow_origins=["*"]），便于开发调试。

生产环境部署时，将 allow_origins 改为具体前端域名。

前端（React + Vite + React Router）
使用 react-router-dom 管理路由。

通过 Axios 调用后端 API，携带 Authorization: Bearer <token>。

已集成 TailwindCSS，样式通过 className 控制。

路由结构：

/login：登录页面

/：主界面（需登录）

启动顺序
先启动后端：uvicorn app.main:app --reload

再启动前端：npm run dev

---

## 11. 提交与版本控制规范
每次提交前，确保项目可以正常运行。

提交信息格式：<类型>: <简短描述>

示例：feat: 添加用户认证系统、fix: 修复时间块拖拽更新问题、docs: 更新项目宪法至 v4.0

禁止提交：

.env 文件（已在 .gitignore 中排除）

.venv/ 和 node_modules/ 文件夹（已在 .gitignore 中排除）

---

## 12. 当前已实现功能清单

---
|模块	|状态	|说明|
| :--- | :--- | :--- | 
|后端 FastAPI 服务	|✅ 已完成	|支持 /api/v1/research 和 /auth 接口|
|用户认证系统|	✅ 已完成	|邮箱验证码登录 + JWT Token|
|数据隔离	|✅ 已完成	|所有业务表包含 user_id，查询自动过滤|
|前端登录页面	|✅ 已完成	|邮箱验证码登录流程|
|前端路由守卫	|✅ 已完成	|未登录自动跳转登录页|
|前端主界面	|✅ 已完成	|对话模式 + 左侧时间线预览|
|时间块基础模型	|✅ 已完成	|time_blocks 表支持 date + start_time + end_time|
|时间块 CRUD API	|⏳ 规划中	|增删改查接口|
|时间网格可视化|⏳ 规划中	|可拖拽编辑的时间块界面|
|AI Agent 修改时间块	|⏳ 规划中	|通过对话修改日程|

---
附录：常用命令速查
场景	命令
激活虚拟环境	cd backend && .venv\Scripts\activate
启动后端	uvicorn app.main:app --reload
启动前端	cd frontend && npm run dev
更新 Python 依赖	pip freeze > requirements.txt
安装前端新包	npm install --save <包名>
重置数据库	del backend\data\timemgr.db（重启后端自动重建）
text

---

### 📌 更新说明

| 变更项 | 说明 |
| :--- | :--- |
| **目录结构** | 新增 `auth.py`、`user.py`、`email.py`、`base.py`、`pages/`、`Login.jsx` |
| **环境变量** | 新增邮箱配置（`MAIL_HOST` 等） |
| **API 规范** | 新增认证接口（`/auth/send-otp`、`/auth/login`） |
| **第 7 条（用户认证）** | 全新章节，描述 JWT 认证、数据隔离、路由守卫 |
| **第 8 条（数据库）** | 新增数据库规范，说明共享 Base 和当前表结构 |
| **第 9 条（时间块规划）** | 新增 Phase 2 规划，记录时间块交互设计 |
| **第 12 条（功能清单）** | 更新为当前实际状态，标记已完成和规划中 |
| 文档版本 | 升级为 `v4.0` |

---

这份宪法现在完整记录了项目的**当前状态**和**未来规划**。后续开发时间块功能时，可以在 **第 9 条** 的基础上持续更新。 🚀