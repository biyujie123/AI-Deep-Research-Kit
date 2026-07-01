import time
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.request_response import ResearchRequest
from app.agent.executor import research_agent

router = APIRouter(prefix="/api/v1", tags=["Research Stream"])

@router.post("/research/stream")
async def research_stream(request: ResearchRequest):
    """
    流式执行研究任务，通过 SSE 逐步返回结果。
    """
    async def event_generator():
        try:
            start_time = time.time()
            # 发送初始状态
            yield f"data: {json.dumps({'type': 'status', 'content': '开始研究...'})}\n\n"

            # 调用 Agent（目前仍为同步，稍后我们会用异步流）
            result = research_agent.invoke(
                {"messages": [{"role": "user", "content": request.query}]}
            )
            answer = result["messages"][-1].content
            elapsed = time.time() - start_time

            # 模拟逐字输出（实际要替换为真正的流式获取）
            words = answer.split()
            for i in range(0, len(words), 3):
                chunk = " ".join(words[i:i+3])
                yield f"data: {json.dumps({'type': 'content', 'chunk': chunk + ' '})}\n\n"
                time.sleep(0.05)  # 模拟打字机效果，实际会使用异步流

            # 发送完成信号
            yield f"data: {json.dumps({'type': 'done', 'duration': round(elapsed, 2)})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")