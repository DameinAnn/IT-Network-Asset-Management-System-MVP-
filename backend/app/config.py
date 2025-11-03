import os
from functools import lru_cache

from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "资产管理系统"
    secret_key: str = os.getenv("SECRET_KEY", "change_me_secret")
    access_token_expire_minutes: int = 60 * 12  # 12小时
    sqlite_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
    admin_default_password: str = os.getenv("ADMIN_DEFAULT_PASSWORD", "Admin@123")


@lru_cache
def get_settings() -> Settings:
    return Settings()
