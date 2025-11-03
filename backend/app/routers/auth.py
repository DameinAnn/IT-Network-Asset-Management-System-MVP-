from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_access_token, verify_password
from ..config import get_settings
from ..database import get_db
from ..dependencies import get_current_user
from ..utils.audit import create_audit_log

router = APIRouter(prefix="/api", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    access_token = create_access_token(user.username, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    create_audit_log(
        db,
        user_id=user.id,
        action="LOGIN",
        target_table="users",
        target_id=user.id,
        detail="用户登录",
    )
    return schemas.LoginResponse(
        token=schemas.Token(access_token=access_token),
        user=user,
    )


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
