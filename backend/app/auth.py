from typing import List, Optional
from fastapi import Header, HTTPException, Security, Depends
from app.audit_logger import audit_logger

VALID_ROLES = {"admin", "engineer", "viewer"}

class UserContext:
    def __init__(self, username: str, role: str):
        self.username = username
        self.role = role

def get_current_user(x_user_role: Optional[str] = Header("admin", alias="X-User-Role")) -> UserContext:
    role = (x_user_role or "engineer").lower().strip()
    if role not in VALID_ROLES:
        audit_logger.log_event(
            action="AUTHENTICATION_FAILED",
            resource=f"Role: {x_user_role}",
            user_role="unknown",
            status="DENIED",
            details={"error": "Invalid role specified"}
        )
        raise HTTPException(status_code=403, detail=f"Invalid RBAC role '{x_user_role}'. Allowed: {list(VALID_ROLES)}")
    
    return UserContext(username=f"{role}_user", role=role)

def require_roles(allowed_roles: List[str]):
    def dependency(user: UserContext = Depends(get_current_user)):
        if user.role not in allowed_roles and "admin" not in user.role:
            audit_logger.log_event(
                action="RBAC_ACCESS_DENIED",
                resource=f"Required: {allowed_roles}",
                user_role=user.role,
                status="DENIED",
                details={"required_roles": allowed_roles, "user_role": user.role}
            )
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Role '{user.role}' is not authorized. Required: {allowed_roles}"
            )
        return user
    return dependency
