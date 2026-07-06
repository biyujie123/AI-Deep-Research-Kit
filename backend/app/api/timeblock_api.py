from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from jose import JWTError, jwt

from app.models.timeline_models import SessionLocal, TimeBlock
from app.utils.config import Config

router = APIRouter(prefix="/api/v1/timeblocks", tags=["TimeBlocks"])

# ---------- JWT 认证依赖 ----------
SECRET_KEY = "your-secret-key-change-in-production"  # TODO: 移到 .env
ALGORITHM = "HS256"

def get_current_user_id(token: str = Query(...)) -> int:
    """从 Query 参数中获取 JWT Token 并解析 user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="无效的 Token")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="无效的 Token")

# ---------- 请求/响应模型 ----------
class TimeBlockCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str          # "YYYY-MM-DD"
    start_time: str    # "HH:MM"
    end_time: str      # "HH:MM"
    color: str = "#4F46E5"

class TimeBlockUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    color: Optional[str] = None

class TimeBlockResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    date: str
    start_time: str
    end_time: str
    color: str
    created_at: str

# ---------- API 端点 ----------
@router.get("/", response_model=List[TimeBlockResponse])
def get_timeblocks(
    date: str = Query(..., description="日期，格式 YYYY-MM-DD"),
    token: str = Query(..., description="JWT Token")
):
    """获取指定日期的所有时间块"""
    user_id = get_current_user_id(token)

    session = SessionLocal()
    blocks = session.query(TimeBlock).filter(
        TimeBlock.user_id == user_id,
        TimeBlock.date == date
    ).order_by(TimeBlock.start_time).all()
    session.close()

    return [
        TimeBlockResponse(
            id=b.id,
            user_id=b.user_id,
            title=b.title,
            description=b.description,
            date=b.date,
            start_time=b.start_time,
            end_time=b.end_time,
            color=b.color,
            created_at=b.created_at.isoformat()
        ) for b in blocks
    ]


@router.post("/", response_model=TimeBlockResponse)
def create_timeblock(block: TimeBlockCreate, token: str = Query(...)):
    """创建新的时间块"""
    user_id = get_current_user_id(token)

    # 校验时间格式
    try:
        datetime.strptime(block.date, "%Y-%m-%d")
        datetime.strptime(block.start_time, "%H:%M")
        datetime.strptime(block.end_time, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="日期或时间格式错误")

    if block.start_time >= block.end_time:
        raise HTTPException(status_code=400, detail="开始时间必须早于结束时间")

    session = SessionLocal()
    new_block = TimeBlock(
        user_id=user_id,
        title=block.title,
        description=block.description,
        date=block.date,
        start_time=block.start_time,
        end_time=block.end_time,
        color=block.color
    )
    session.add(new_block)
    session.commit()
    session.refresh(new_block)
    session.close()

    return TimeBlockResponse(
        id=new_block.id,
        user_id=new_block.user_id,
        title=new_block.title,
        description=new_block.description,
        date=new_block.date,
        start_time=new_block.start_time,
        end_time=new_block.end_time,
        color=new_block.color,
        created_at=new_block.created_at.isoformat()
    )


@router.put("/{block_id}", response_model=TimeBlockResponse)
def update_timeblock(block_id: int, block: TimeBlockUpdate, token: str = Query(...)):
    """更新时间块"""
    user_id = get_current_user_id(token)

    session = SessionLocal()
    existing = session.query(TimeBlock).filter(
        TimeBlock.id == block_id,
        TimeBlock.user_id == user_id
    ).first()
    if not existing:
        session.close()
        raise HTTPException(status_code=404, detail="时间块不存在")

    # 更新字段
    if block.title is not None:
        existing.title = block.title
    if block.description is not None:
        existing.description = block.description
    if block.date is not None:
        existing.date = block.date
    if block.start_time is not None:
        existing.start_time = block.start_time
    if block.end_time is not None:
        existing.end_time = block.end_time
    if block.color is not None:
        existing.color = block.color

    session.commit()
    session.refresh(existing)
    session.close()

    return TimeBlockResponse(
        id=existing.id,
        user_id=existing.user_id,
        title=existing.title,
        description=existing.description,
        date=existing.date,
        start_time=existing.start_time,
        end_time=existing.end_time,
        color=existing.color,
        created_at=existing.created_at.isoformat()
    )


@router.delete("/{block_id}")
def delete_timeblock(block_id: int, token: str = Query(...)):
    """删除时间块"""
    user_id = get_current_user_id(token)

    session = SessionLocal()
    existing = session.query(TimeBlock).filter(
        TimeBlock.id == block_id,
        TimeBlock.user_id == user_id
    ).first()
    if not existing:
        session.close()
        raise HTTPException(status_code=404, detail="时间块不存在")

    session.delete(existing)
    session.commit()
    session.close()

    return {"message": "删除成功", "id": block_id}