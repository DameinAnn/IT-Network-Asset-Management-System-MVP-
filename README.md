# 计算机及网络设备资产管理系统（MVP）

该项目提供一套基于 FastAPI + React + Tailwind CSS 的轻量级资产管理系统，用于在企业内网中管理计算机与网络设备资产。系统实现了角色权限控制、资产 CRUD、用户管理以及操作审计等核心能力。

## 项目结构

```
.
├── backend            # FastAPI 后端服务
│   ├── app
│   │   ├── main.py    # 应用入口，包含初始化逻辑
│   │   ├── models.py  # SQLAlchemy 数据模型
│   │   ├── schemas.py # Pydantic 模型
│   │   └── routers    # 业务路由（认证、资产、用户）
│   └── requirements.txt
└── frontend           # React + Vite 前端工程
    └── src
        ├── pages      # 登录、资产列表、资产表单、用户管理页面
        └── components # 全局布局、导航
```

## 运行后端

1. 创建虚拟环境并安装依赖：

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Windows 使用 .venv\\Scripts\\activate
   pip install -r requirements.txt

   > **提示**：依赖中已固定 `bcrypt==4.0.1` 版本，以避免在 Windows 环境下因较新版本的 `bcrypt` 与 Passlib 不兼容而导致服务启动失败。
   ```

2. 启动 FastAPI 服务：

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   首次启动会自动在 `./data/app.db` 中创建 SQLite 数据库并初始化角色与默认管理员账号（用户名 `admin`，默认密码 `Admin@123`）。

## 运行前端

1. 安装依赖：

   ```bash
   cd frontend
   npm install
   ```

2. 启动开发服务器：

   ```bash
   npm run dev
   ```

   默认访问地址为 [http://localhost:5173](http://localhost:5173)。如需连接不同后端地址，可在启动前设置 `VITE_API_BASE` 环境变量。

## 默认角色权限

| 角色 | 权限说明 |
| --- | --- |
| 管理员（admin） | 拥有用户管理和资产的新增、查询、修改、删除权限 |
| 编辑者（editor） | 拥有资产新增、查询、修改、删除权限，但无法管理用户 |
| 查看者（viewer） | 仅能查看资产信息 |

## 审计日志

系统会对登录、资产 CRUD、用户管理操作写入审计日志（`audit_logs` 表），以便后续追踪。

## 生产部署建议

- 将 `SECRET_KEY`、`ADMIN_DEFAULT_PASSWORD`、`DATABASE_URL` 等配置通过环境变量覆盖。
- 对接企业内部认证系统或使用 HTTPS 保障通信安全。
- 安排定时任务备份 SQLite 数据文件。

如需扩展二维码盘点、巡检拍照等功能，可在后续迭代中继续演进。
