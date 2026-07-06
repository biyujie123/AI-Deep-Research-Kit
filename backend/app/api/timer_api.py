from fastapi import APIRouter
from datetime import datetime
from app.models.timeline_models import SessionLocal, TimerRecord

router = APIRouter(prefix="/api/v1/timer", tags=["Timer"])

@router.get("/status")
def get_timer_status():
    session = SessionLocal()
    # 获取最近一条未完成的计时器记录
    record = session.query(TimerRecord).filter(
        TimerRecord.is_completed == False
    ).order_by(TimerRecord.started_at.desc()).first()
    session.close()

    if not record:
        return {"is_running": False}

    now = datetime.now()
    elapsed = (now - record.started_at).total_seconds()
    total = record.duration_minutes * 60

    return {
        "is_running": elapsed < total,
        "total": total,
        "elapsed": min(elapsed, total),
        "duration_minutes": record.duration_minutes,
        "timer_type": record.timer_type,
        "started_at": record.started_at.isoformat()
    }