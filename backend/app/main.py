from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine
from .models import Role, User
from .routers import assets, auth, users
from .utils.audit import create_audit_log
from .auth import get_password_hash

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(users.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    from sqlalchemy.orm import Session

    session = Session(bind=engine)
    try:
        roles_definitions = {
            "admin": {
                "can_create_asset": True,
                "can_read_asset": True,
                "can_update_asset": True,
                "can_delete_asset": True,
                "can_manage_users": True,
            },
            "editor": {
                "can_create_asset": True,
                "can_read_asset": True,
                "can_update_asset": True,
                "can_delete_asset": True,
                "can_manage_users": False,
            },
            "viewer": {
                "can_create_asset": False,
                "can_read_asset": True,
                "can_update_asset": False,
                "can_delete_asset": False,
                "can_manage_users": False,
            },
        }
        for role_name, permissions in roles_definitions.items():
            role = session.query(Role).filter(Role.role_name == role_name).first()
            if not role:
                role = Role(role_name=role_name, **permissions)
                session.add(role)
        session.commit()

        admin_role = session.query(Role).filter(Role.role_name == "admin").first()
        if admin_role:
            admin_user = session.query(User).filter(User.username == "admin").first()
            if not admin_user:
                admin_user = User(
                    username="admin",
                    display_name="系统管理员",
                    dept="信息中心",
                    role_id=admin_role.id,
                    password_hash=get_password_hash(settings.admin_default_password),
                )
                session.add(admin_user)
                session.commit()
                create_audit_log(
                    session,
                    user_id=None,
                    action="CREATE",
                    target_table="users",
                    target_id=admin_user.id,
                    detail="初始化管理员账号",
                )
    finally:
        session.close()
