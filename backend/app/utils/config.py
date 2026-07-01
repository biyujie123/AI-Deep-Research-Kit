import os
from pathlib import Path
from dotenv import load_dotenv

# 定位到 backend 目录下的 .env 文件（因为 config.py 在 backend/app/utils/ 里，需要往上跳两级）
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# 加载 .env 文件
load_dotenv(dotenv_path=ENV_PATH, override=True)


class Config:
    """统一管理所有环境变量，缺失时立即报错"""
    
    # 硅基流动（必需）
    SILICON_API_KEY = os.getenv("SILICONFLOW_API_KEY")
    MODEL_NAME = os.getenv("MODEL_NAME", "deepseek-ai/DeepSeek-V4-Pro")
    
    # Tavily 搜索（必需）
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    
    # LangSmith（可选，没有也不报错）
    LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
    LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING", "false").lower() == "true"

    @classmethod
    def validate(cls):
        """检查必需的环境变量是否都已配置"""
        required_vars = [
            ("SILICON_API_KEY", cls.SILICON_API_KEY),
            ("TAVILY_API_KEY", cls.TAVILY_API_KEY),
        ]
        for name, value in required_vars:
            if not value:
                raise ValueError(f"❌ 环境变量 {name} 未配置！请在 {ENV_PATH} 中设置。")
        print("✅ 所有必需的环境变量均已加载。")


# 程序启动时自动校验
Config.validate()