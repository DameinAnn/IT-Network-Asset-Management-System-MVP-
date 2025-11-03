from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models
from .auth import validate_token
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效或已过期的登录令牌",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_payload = validate_token(token)
    if not token_payload:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_payload.sub).first()
    if not user or not user.is_active:
        raise credentials_exception
    return user


def require_permission(permission_field: str):
    def wrapper(current_user: models.User = Depends(get_current_user)) -> models.User:
        role = current_user.role
        if not getattr(role, permission_field, False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="权限不足")
        return current_user

    return wrapper
