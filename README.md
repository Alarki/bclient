# Bclient - Binary City Assessment

A full-stack web application built for the Binary City Software Developer practical assessment. It manages Clients and Contacts with a many-to-many relationship, featuring auto-generated client codes, tabbed forms, and AJAX-driven UI.

## Technologies Used
- **Backend:** Python 3.13, FastAPI, SQLAlchemy (ORM), Pydantic
- **Database:** PostgreSQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API for AJAX)
- **Migrations:** Alembic

## Architecture
The project follows an MVC-style separation of concerns:
- **Models:** SQLAlchemy database models (`app/models/`)
- **Views:** HTML templates and vanilla JavaScript (`app/templates/`, `app/static/`)
- **Controllers:** FastAPI routes (`app/routes/`)
- **Services:** Business logic and database transactions (`app/services/`)
- **Schemas:** Pydantic validation models (`app/schemas/`)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd bclient