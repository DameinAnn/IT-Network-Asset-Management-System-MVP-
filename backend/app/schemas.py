from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int


class RoleInfo(BaseModel):
    id: int
    role_name: str
    can_create_asset: bool
    can_read_asset: bool
    can_update_asset: bool
    can_delete_asset: bool
    can_manage_users: bool

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    display_name: Optional[str]
    dept: Optional[str]
    is_active: bool = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    display_name: Optional[str]
    dept: Optional[str]
    role_id: int
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    display_name: Optional[str]
    dept: Optional[str]
    role_id: Optional[int]
    is_active: Optional[bool]
    password: Optional[str] = Field(None, min_length=6)


class UserOut(UserBase):
    id: int
    role: RoleInfo
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AssetBase(BaseModel):
    asset_code: str
    category: str
    brand: Optional[str]
    model: Optional[str]
    serial_number: Optional[str]
    location: Optional[str]
    owner_dept: Optional[str]
    ip_address: Optional[str]
    mac_address: Optional[str]
    os_or_firmware: Optional[str]
    status: str
    note: Optional[str]


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: Optional[str]
    category: Optional[str]
    brand: Optional[str]
    model: Optional[str]
    serial_number: Optional[str]
    location: Optional[str]
    owner_dept: Optional[str]
    ip_address: Optional[str]
    mac_address: Optional[str]
    os_or_firmware: Optional[str]
    status: Optional[str]
    note: Optional[str]


class AssetOut(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: Token
    user: UserOut
