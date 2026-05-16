from pydantic import BaseModel, Field, EmailStr

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserRegister(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30
    )

    email: EmailStr

    password: str = Field(
        min_length=6
    )
    phone: str | None = None