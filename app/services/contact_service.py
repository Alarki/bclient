from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.contact import Contact
from app.models.client import Client
from app.models.client_contact import ClientContact
from sqlalchemy.exc import IntegrityError

class ContactService:
    def __init__(self, db: Session):
        self.db = db

    def create_contact(self, name: str, surname: str, email: str) -> Contact:
        """Creates a new contact."""
        new_contact = Contact(name=name, surname=surname, email=email)
        self.db.add(new_contact)
        try:
            self.db.commit()
            self.db.refresh(new_contact)
            return new_contact
        except IntegrityError:
            self.db.rollback()
            # The database unique constraint on 'email' will trigger this
            raise ValueError("A contact with this email address already exists.")

    def get_all_contacts(self):
        """Returns all contacts ordered by Surname then Name, with client counts."""
        results = (
            self.db.query(Contact, func.count(ClientContact.client_id).label("client_count"))
            .outerjoin(ClientContact, Contact.id == ClientContact.contact_id)
            .group_by(Contact.id)
            .order_by(Contact.surname.asc(), Contact.name.asc())
            .all()
        )
        
        return [
            {
                "id": contact.id,
                "name": contact.name,
                "surname": contact.surname,
                "email": contact.email,
                "client_count": count
            }
            for contact, count in results
        ]

    def get_contact_by_id(self, contact_id: int) -> Contact:
        return self.db.query(Contact).filter(Contact.id == contact_id).first()

    def get_contact_clients(self, contact_id: int):
        """Returns all clients linked to a specific contact, sorted by Name."""
        clients = (
            self.db.query(Client)
            .join(ClientContact, Client.id == ClientContact.client_id)
            .filter(ClientContact.contact_id == contact_id)
            .order_by(Client.name.asc())
            .all()
        )
        return clients