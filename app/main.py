from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.database import engine, Base
from app.models import Client, Contact, ClientContact
from app.routes.clients import router as clients_router
from app.routes.contacts import router as contacts_router

app = FastAPI(title="Binary City Assessment")


app.include_router(clients_router)
app.include_router(contacts_router)

# Mount static files (CSS/JS)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
def home(request: Request):
    # Redirect to the clients list page by default
    return templates.TemplateResponse(request=request, name="clients.html")

@app.get("/contacts")
def contacts_page(request: Request):
    return templates.TemplateResponse("contacts.html", {"request": request})