from typing import Any, Optional

from sqlalchemy.orm import Session

from .. import models


def create_audit_log(
    db: Session,
    *,
    user_id: Optional[int],
    action: str,
    target_table: Optional[str] = None,
    target_id: Optional[int] = None,
    detail: Optional[Any] = None,
) -> models.AuditLog:
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        detail=str(detail) if detail is not None else None,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
