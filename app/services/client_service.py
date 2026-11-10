from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.client import Client
from app.models.contact import Contact
from app.models.client_contact import ClientContact
from app.services.client_code import ClientCodeGenerator
from sqlalchemy.exc import IntegrityError

class ClientService:
    def __init__(self, db: Session):
        self.db = db

    def create_client(self, name: str) -> Client:
        """Creates a new client and generates a unique code."""
        client_code = ClientCodeGenerator.generate_unique_code(name, self.db)
        
        new_client = Client(name=name, client_code=client_code)
        self.db.add(new_client)
        try:
            self.db.commit()
            self.db.refresh(new_client)
            return new_client
        except IntegrityError:
            self.db.rollback()
            raise ValueError("A client with this code already exists.")

    def get_all_clients(self):
        """Returns all clients ordered by name, along with their contact counts."""
        # We use an outer join to get the count of contacts for each client
        results = (
            self.db.query(Client, func.count(ClientContact.contact_id).label("contact_count"))
            .outerjoin(ClientContact, Client.id == ClientContact.client_id)
            .group_by(Client.id)
            .order_by(Client.name.asc())
            .all()
        )
        
        # Format the output as a list of dictionaries
        return [
            {
                "id": client.id,
                "name": client.name,
                "client_code": client.client_code,
                "contact_count": count
            }
            for client, count in results
        ]

    def get_client_by_id(self, client_id: int) -> Client:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_client_contacts(self, client_id: int):
        """Returns all contacts linked to a specific client, sorted by Surname and Name."""
        client = self.get_client_by_id(client_id)
        if not client:
            return None
        
        # Query the contacts linked to this client
        contacts = (
            self.db.query(Contact)
            .join(ClientContact, Contact.id == ClientContact.contact_id)
            .filter(ClientContact.client_id == client_id)
            .order_by(Contact.surname.asc(), Contact.name.asc())
            .all()
        )
        return contacts

    def link_contact(self, client_id: int, contact_id: int):
        """Links a contact to a client."""
        # Check if the link already exists
        existing_link = self.db.query(ClientContact).filter_by(client_id=client_id, contact_id=contact_id).first()
        if existing_link:
            raise ValueError("Contact is already linked to this client.")

        new_link = ClientContact(client_id=client_id, contact_id=contact_id)
        self.db.add(new_link)
        self.db.commit()

    def unlink_contact(self, client_id: int, contact_id: int):
        """Removes the link between a client and a contact (does not delete them)."""
        link = self.db.query(ClientContact).filter_by(client_id=client_id, contact_id=contact_id).first()
        if not link:
            raise ValueError("Link not found.")
        
        self.db.delete(link)
        self.db.commit()