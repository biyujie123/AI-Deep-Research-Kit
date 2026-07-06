from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
import time

from app.utils.email import generate_otp, send_otp_email
from app.models.timeline_models import SessionLocal
from app.models.user import User
from app.utils.config import Config

router = APIRouter(prefix="/auth", tags=["Auth"])

# 临时存储验证码（开发用），生产环境应使用 Redis
otp_storage = {}

# JWT 配置
SECRET_KEY = "your-secret-key-change-in-production"  # TODO: 移到 .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7天


class SendOTPRequest(BaseModel):
    email: str


class LoginRequest(BaseModel):
    email: str
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/send-otp")
def send_otp(request: SendOTPRequest):
    """发送验证码到指定邮箱"""
    otp = generate_otp()
    if send_otp_email(request.email, otp):
        # 存储验证码，5分钟后过期
        otp_storage[request.email] = {
            "otp": otp,
            "expires_at": time.time() + 300
        }
        # 开发时方便调试：返回验证码（生产环境请删除）
        return {"message": "验证码已发送", "debug_otp": otp}
    raise HTTPException(status_code=500, detail="发送邮件失败")


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    """验证码登录，返回 JWT Token"""
    record = otp_storage.get(request.email)
    if not record:
        raise HTTPException(status_code=400, detail="验证码已过期，请重新获取")

    if time.time() > record["expires_at"]:
        del otp_storage[request.email]
        raise HTTPException(status_code=400, detail="验证码已过期")

    if record["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="验证码错误")

    # 验证通过，查找或创建用户
    session = SessionLocal()
    user = session.query(User).filter(User.email == request.email).first()
    if not user:
        user = User(email=request.email)
        session.add(user)
        session.commit()
        session.refresh(user)

    # 生成 JWT Token
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user.id), "exp": expire, "email": user.email}
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    session.close()

    # 清除已使用的验证码
    del otp_storage[request.email]

    return TokenResponse(access_token=access_token)


@router.get("/me")
def get_current_user():
    """获取当前用户信息（需要 JWT 认证）"""
    # TODO: 实现 JWT 验证逻辑
    return {"message": "需要先实现 JWT 验证中间件"}