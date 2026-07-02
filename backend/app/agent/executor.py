from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from app.utils.config import Config
from app.agent.tools import internet_search, create_time_block, create_memo, start_timer

def create_research_agent():
    model = ChatOpenAI(
        model=Config.MODEL_NAME,
        api_key=Config.SILICON_API_KEY,
        base_url="https://api.siliconflow.cn/v1",
        temperature=0.1,
        timeout=60,
    )
    agent = create_deep_agent(
        model=model,
        tools=[internet_search, create_time_block, create_memo, start_timer],
        system_prompt="你是一位专业的研究员，可以使用 internet_search 工具搜索互联网信息。"
    )
    return agent

# 为了性能，在服务启动时只初始化一次（单例模式）
research_agent = create_research_agent()