from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入刚才写的“点餐路由”
from app.api import research, timeline_api

# FastAPI 
app = FastAPI(
    title="AI 深q度研究助手 API",
    description="基于 DeepAgents 的智能搜索与报告生成服务",
    version="0.1.0"
)

# ---------- 配置跨域（CORS）----------
# 含义：允许来自不同地址（比如你的前端页面）的访问请求。
# 在开发阶段，我们允许所有来源（"*"），方便调试。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境请换成具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 注册路由（把服务员招聘进来）----------
app.include_router(research.router)
app.include_router(timeline_api.router)

# ---------- 写一个根目录问候语（方便测试）----------
@app.get("/")
async def root():
    return {"message": "AI 深度研究助手 API 正在运行", "docs": "/docs"}

# ---------- （可选）运行调试代码，仅供直接执行此文件时使用 ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)