"""
Shared auth dependencies: extract + validate the current user from a
JWT bearer token, and enforce role-based route access.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials — please log in again",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise unauthorized

    payload = decode_access_token(token)
    if payload is None:
        # Covers both invalid signature and expired tokens (jose raises
        # the same JWTError for both, caught inside decode_access_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired — please log in again",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = payload.get("sub")
    if username is None:
        raise unauthorized

    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise unauthorized

    return user


def require_role(*allowed_roles: str):
    """Route guard factory, e.g. Depends(require_role('admin'))"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.value}' does not have access to this resource",
            )
        return current_user
    return role_checker