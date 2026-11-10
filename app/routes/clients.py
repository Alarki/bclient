from app.schemas.contact import ContactResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.client_service import ClientService
from app.schemas.client import ClientCreate, ClientListResponse, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["Clients"])

@router.post("/", response_model=ClientResponse)
def create_client(client_in: ClientCreate, db: Session = Depends(get_db)):
    service = ClientService(db)
    try:
        new_client = service.create_client(client_in.name)
        return new_client
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ClientListResponse])
def get_clients(db: Session = Depends(get_db)):
    service = ClientService(db)
    return service.get_all_clients()

@router.get("/{client_id}/contacts", response_model=List[ContactResponse])
def get_client_contacts(client_id: int, db: Session = Depends(get_db)):
    service = ClientService(db)
    contacts = service.get_client_contacts(client_id)
    if contacts is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return contacts

@router.post("/{client_id}/contacts/{contact_id}")
def link_contact(client_id: int, contact_id: int, db: Session = Depends(get_db)):
    service = ClientService(db)
    try:
        service.link_contact(client_id, contact_id)
        return {"message": "Contact linked successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{client_id}/contacts/{contact_id}")
def unlink_contact(client_id: int, contact_id: int, db: Session = Depends(get_db)):
    service = ClientService(db)
    try:
        service.unlink_contact(client_id, contact_id)
        return {"message": "Contact unlinked successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))