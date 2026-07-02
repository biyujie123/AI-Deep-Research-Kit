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

from datetime import datetime
from app.models.timeline_models import SessionLocal, TimeBlock, Memo, TimerRecord

@tool
def create_time_block(start_time: str, end_time: str, title: str, description: str = "") -> str:
    """
    创建时间块，用于规划日程。

    Args:
        start_time: 开始时间，格式为 'YYYY-MM-DD HH:MM'
        end_time: 结束时间，格式为 'YYYY-MM-DD HH:MM'
        title: 时间块的标题
        description: 可选描述
    """
    try:
        start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M")
        end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M")
        if start_dt >= end_dt:
            return "❌ 开始时间必须早于结束时间"
        session = SessionLocal()
        block = TimeBlock(
            title=title,
            description=description,
            start_time=start_dt,
            end_time=end_dt
        )
        session.add(block)
        session.commit()
        session.close()
        return f"✅ 已创建时间块：{title}，从 {start_time} 到 {end_time}"
    except ValueError:
        return "❌ 时间格式错误，请使用 'YYYY-MM-DD HH:MM' 格式"
    except Exception as e:
        return f"❌ 创建失败：{str(e)}"

@tool
def create_memo(content: str, remind_at: str = "") -> str:
    """
    创建便签或备忘录。

    Args:
        content: 便签内容
        remind_at: 提醒时间（可选），格式为 'YYYY-MM-DD HH:MM'
    """
    try:
        remind_dt = None
        if remind_at:
            remind_dt = datetime.strptime(remind_at, "%Y-%m-%d %H:%M")
        session = SessionLocal()
        memo = Memo(content=content, remind_at=remind_dt)
        session.add(memo)
        session.commit()
        session.close()
        msg = f"✅ 已创建便签：{content}"
        if remind_dt:
            msg += f"，将在 {remind_at} 提醒"
        return msg
    except ValueError:
        return "❌ 提醒时间格式错误，请使用 'YYYY-MM-DD HH:MM' 格式"
    except Exception as e:
        return f"❌ 创建失败：{str(e)}"

@tool
def start_timer(duration_minutes: int, timer_type: str = "pomodoro") -> str:
    """
    启动计时器（番茄钟或倒计时）。

    Args:
        duration_minutes: 计时时长（分钟）
        timer_type: 计时类型，'pomodoro' 或 'countdown'
    """
    try:
        session = SessionLocal()
        record = TimerRecord(
            duration_minutes=duration_minutes,
            timer_type=timer_type,
            started_at=datetime.now()
        )
        session.add(record)
        session.commit()
        session.close()
        return f"⏰ 已启动 {timer_type} 计时器，时长 {duration_minutes} 分钟"
    except Exception as e:
        return f"❌ 启动失败：{str(e)}"