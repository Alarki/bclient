from pydantic import BaseModel, Field
from typing import List

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="The name of the client")

class ClientListResponse(BaseModel):
    id: int
    name: str
    client_code: str
    contact_count: int

class ClientResponse(BaseModel):
    id: int
    name: str
    client_code: str

    class Config:
        from_attributes = True