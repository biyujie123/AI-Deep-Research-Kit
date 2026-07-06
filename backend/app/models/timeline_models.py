from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import sessionmaker

from app.models.base import Base

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "timemgr.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TimeBlock(Base):
    __tablename__ = "time_blocks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(20), nullable=False, index=True)      # "YYYY-MM-DD"
    start_time = Column(String(10), nullable=False)            # "HH:MM"
    end_time = Column(String(10), nullable=False)              # "HH:MM"
    color = Column(String(20), default="#4F46E5")              # 十六进制颜色
    created_at = Column(DateTime, default=datetime.now)

class Memo(Base):
    __tablename__ = "memos"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    remind_at = Column(DateTime, nullable=True)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    user_id = Column(Integer, nullable=False, index=True)

class TimerRecord(Base):
    __tablename__ = "timer_records"
    id = Column(Integer, primary_key=True, index=True)
    duration_minutes = Column(Integer, nullable=False)
    timer_type = Column(String(50), default="pomodoro")
    started_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    user_id = Column(Integer, nullable=False, index=True)

print("当前注册的表：", Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)