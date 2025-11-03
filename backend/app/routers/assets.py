from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_permission
from ..utils.audit import create_audit_log

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("", response_model=List[schemas.AssetOut])
def list_assets(
    asset_code: Optional[str] = Query(None, description="资产编号"),
    ip_address: Optional[str] = Query(None, description="IP地址"),
    category: Optional[str] = Query(None, description="类别"),
    status_filter: Optional[str] = Query(None, alias="status", description="状态"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_read_asset")),
):
    query = db.query(models.Asset)
    if asset_code:
        query = query.filter(models.Asset.asset_code.contains(asset_code))
    if ip_address:
        query = query.filter(models.Asset.ip_address.contains(ip_address))
    if category:
        query = query.filter(models.Asset.category == category)
    if status_filter:
        query = query.filter(models.Asset.status == status_filter)
    return query.order_by(models.Asset.updated_at.desc()).all()


@router.get("/{asset_id}", response_model=schemas.AssetOut)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_read_asset")),
):
    asset = db.get(models.Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资产不存在")
    return asset


@router.post("", response_model=schemas.AssetOut, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_create_asset")),
):
    if db.query(models.Asset).filter(models.Asset.asset_code == payload.asset_code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="资产编号已存在")
    asset = models.Asset(**payload.dict())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    create_audit_log(
        db,
        user_id=current_user.id,
        action="CREATE",
        target_table="assets",
        target_id=asset.id,
        detail=payload.dict(),
    )
    return asset


@router.put("/{asset_id}", response_model=schemas.AssetOut)
def update_asset(
    asset_id: int,
    payload: schemas.AssetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_update_asset")),
):
    asset = db.get(models.Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资产不存在")
    update_data = payload.dict(exclude_unset=True)
    if "asset_code" in update_data:
        duplicate = (
            db.query(models.Asset)
            .filter(models.Asset.asset_code == update_data["asset_code"], models.Asset.id != asset_id)
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="资产编号已存在")
    for key, value in update_data.items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)
    create_audit_log(
        db,
        user_id=current_user.id,
        action="UPDATE",
        target_table="assets",
        target_id=asset.id,
        detail=update_data,
    )
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("can_delete_asset")),
):
    asset = db.get(models.Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="资产不存在")
    db.delete(asset)
    db.commit()
    create_audit_log(
        db,
        user_id=current_user.id,
        action="DELETE",
        target_table="assets",
        target_id=asset.id,
        detail={"asset_code": asset.asset_code},
    )
    return None
