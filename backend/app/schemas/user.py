from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    username: str
    full_name: str | None
    role: UserRole
    is_active: bool
    is_demo: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut