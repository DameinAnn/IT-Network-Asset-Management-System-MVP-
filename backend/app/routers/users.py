from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_password_hash
from ..database import get_db
from ..dependencies import require_permission
from ..utils.audit import create_audit_log

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/roles", response_model=List[schemas.RoleInfo])
def list_roles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_manage_users")),
):
    return db.query(models.Role).order_by(models.Role.id).all()


@router.get("", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_manage_users")),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.post("", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_manage_users")),
):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已存在")
    role = db.get(models.Role, payload.role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="角色不存在")
    user = models.User(
        username=payload.username,
        display_name=payload.display_name,
        dept=payload.dept,
        role_id=payload.role_id,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    create_audit_log(
        db,
        user_id=current_user.id,
        action="CREATE",
        target_table="users",
        target_id=user.id,
        detail={"username": payload.username, "role_id": payload.role_id},
    )
    return user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_manage_users")),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    update_data = payload.dict(exclude_unset=True)
    if "role_id" in update_data:
        role = db.get(models.Role, update_data["role_id"])
        if not role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="角色不存在")
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    create_audit_log(
        db,
        user_id=current_user.id,
        action="UPDATE",
        target_table="users",
        target_id=user.id,
        detail=update_data,
    )
    return user
