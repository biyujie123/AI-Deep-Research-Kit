from fastapi import APIRouter
from datetime import datetime
from app.models.timeline_models import SessionLocal, TimeBlock, Memo

router = APIRouter(prefix="/api/v1/timeline", tags=["Timeline"])

@router.get("/today")
def get_today_timeline():
    today = datetime.now().date()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59)

    session = SessionLocal()
    blocks = session.query(TimeBlock).filter(
        TimeBlock.start_time >= start_of_day,
        TimeBlock.start_time <= end_of_day
    ).all()
    memos = session.query(Memo).filter(
        Memo.created_at >= start_of_day,
        Memo.created_at <= end_of_day
    ).all()
    session.close()

    return {
        "date": today.isoformat(),
        "blocks": [
            {
                "id": b.id,
                "title": b.title,
                "description": b.description,
                "start_time": b.start_time.isoformat(),
                "end_time": b.end_time.isoformat()
            } for b in blocks
        ],
        "memos": [
            {
                "id": m.id,
                "content": m.content,
                "remind_at": m.remind_at.isoformat() if m.remind_at else None,
                "is_done": m.is_done
            } for m in memos
        ]
    }