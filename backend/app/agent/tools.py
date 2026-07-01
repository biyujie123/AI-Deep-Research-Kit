from typing import Literal
from langchain.tools import tool
from tavily import TavilyClient
from app.utils.config import Config

# 从统一的配置文件中读取密钥
tavily_client = TavilyClient(api_key=Config.TAVILY_API_KEY)

@tool
def internet_search(
    query: str,
    max_results: int = 3,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
) -> dict:
    """根据给定查询执行网页搜索，返回结构化结果。"""
    return tavily_client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )