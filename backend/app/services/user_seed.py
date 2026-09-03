"""
Seeds 3 demo accounts (one per role) on startup for development/demo use.

IMPORTANT: These are development-only credentials with weak passwords.
Do not deploy this seeding logic to a production environment as-is.
"""
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import hash_password

DEMO_USERS = [
    {"username": "admin", "password": "admin123", "full_name": "Admin User", "role": UserRole.ADMIN},
    {"username": "engineer", "password": "engineer123", "full_name": "Engineer User", "role": UserRole.ENGINEER},
    {"username": "operator", "password": "operator123", "full_name": "Operator User", "role": UserRole.OPERATOR},
]


def seed_demo_users(db: Session) -> None:
    for demo in DEMO_USERS:
        exists = db.query(User).filter(User.username == demo["username"]).first()
        if not exists:
            db.add(User(
                username=demo["username"],
                full_name=demo["full_name"],
                hashed_password=hash_password(demo["password"]),
                role=demo["role"],
                is_demo=True,
            ))
    db.commit()