from pydantic import BaseModel, EmailStr, Field
from typing import List

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    surname: str = Field(..., min_length=1, max_length=255)
    # EmailStr automatically validates the format (e.g., must contain @)
    email: EmailStr = Field(..., description="Must be a valid email address")

class ContactListResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    client_count: int

class ContactResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str

    class Config:
        from_attributes = True