import time
from fastapi import APIRouter, HTTPException
from app.models.request_response import ResearchRequest, ResearchResponse
from app.agent.executor import research_agent  # 导入真脑子

router = APIRouter(prefix="/api/v1", tags=["Research"])

@router.post("/research", response_model=ResearchResponse)
async def perform_research(request: ResearchRequest):
    try:
        start_time = time.time()
        print(f"🛎️ 收到用户请求：{request.query}")
        
        # 调用真正的 Agent 进行推理
        result = research_agent.invoke(
            {"messages": [{"role": "user", "content": request.query}]}
        )
        answer = result["messages"][-1].content
        
        elapsed = time.time() - start_time
        return ResearchResponse(
            status="success",
            data=answer,
            duration_seconds=round(elapsed, 2)
        )
    except Exception as e:
        # 把具体错误打印在终端，方便你调试
        print(f"❌ 发生错误：{e}")
        raise HTTPException(status_code=500, detail=str(e))