from app.schemas.client import ClientResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.contact_service import ContactService
from app.schemas.contact import ContactCreate, ContactListResponse, ContactResponse

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

@router.post("/", response_model=ContactResponse)
def create_contact(contact_in: ContactCreate, db: Session = Depends(get_db)):
    service = ContactService(db)
    try:
        new_contact = service.create_contact(contact_in.name, contact_in.surname, contact_in.email)
        return new_contact
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ContactListResponse])
def get_contacts(db: Session = Depends(get_db)):
    service = ContactService(db)
    return service.get_all_contacts()

@router.get("/{contact_id}/clients", response_model=List[ClientResponse])
def get_contact_clients(contact_id: int, db: Session = Depends(get_db)):
    service = ContactService(db)
    clients = service.get_contact_clients(contact_id)
    if clients is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return clients