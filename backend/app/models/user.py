"""
User accounts with role-based access.
Passwords are always stored hashed (bcrypt) — never in plain text.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Boolean
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ENGINEER = "engineer"
    OPERATOR = "operator"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.OPERATOR)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=True)  # flags seeded demo accounts
    created_at = Column(DateTime, default=datetime.utcnow)