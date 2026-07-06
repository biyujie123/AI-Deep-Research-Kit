from pydantic import BaseModel
from typing import List, Dict


# 这个类定义了前端
class ResearchRequest(BaseModel):
    query: str  # 问题
    history: List[Dict[str, str]] = []  # 新增

# 这个类定义了后端
class ResearchResponse(BaseModel):
    status: str          # 比如 "success" 或 "error"
    data: str            # Agent 生成的最终回答内容
    duration_seconds: float  # 处理耗时


