# LaMaCoP Full-Stack Platform

Production-ready showcase and client portal for **LaMaCoP (Laboratory of Ceramic and Polymer Composites)**.

## Stack
- Frontend: Next.js (App Router) + React Hooks + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: MySQL (Azure-ready via environment variables)
- Auth: JWT + hashed passwords (`bcrypt` via `passlib`)
- Containers: Docker + Docker Compose
- CI/CD: GitHub Actions (Docker Hub + Azure VM over SSH)

## Features
- Responsive pages: Home, About, Services, Projects, Contact
- Contact form connected to backend (`POST /api/v1/contact`)
- API endpoints:
  - `GET /api/v1/services`
  - `GET /api/v1/projects`
  - `POST /api/v1/contact`
- Authentication and roles:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - Admin-protected contacts listing: `GET /api/v1/contact`
- Admin/User sign-in with role support and protected admin view

## Project Structure
```
lamacop/
├─ frontend/
│  ├─ src/app/...
│  ├─ src/components/...
│  └─ Dockerfile
├─ backend/
│  ├─ app/api/routes/...
│  ├─ app/models/...
│  ├─ app/schemas/...
│  ├─ app/core/...
│  └─ Dockerfile
├─ database/
│  └─ init.sql
├─ .github/workflows/
│  └─ ci-cd.yml
└─ docker-compose.yml
```

## Local Setup (Docker)
1. Create env files:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Update secrets and DB credentials in `.env` files.
3. Run:
   - `docker compose up --build`
4. Access:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

## Local Setup (Without Docker)
### Backend
1. `cd backend`
2. `python -m venv .venv`
3. Activate virtual environment
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and set values
6. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npm run dev`

## Database
- SQL initialization script: `database/init.sql`
- Required tables:
  - `contacts`
  - `services`
  - `projects`
  - `users`

## Security Notes
- Do not hardcode credentials in code.
- Keep `.env` files out of git.
- Use `ADMIN_REGISTRATION_KEY` to control admin account creation.
- Use strong `SECRET_KEY` in production.

## GitHub Actions CI/CD
Workflow: `.github/workflows/ci-cd.yml`

Set repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `AZURE_VM_HOST`
- `AZURE_VM_USER`
- `AZURE_VM_PASSWORD`

Deployment expects on VM:
- `/opt/lamacop/backend.env`
- `/opt/lamacop/frontend.env`

## API Quick Test
- Health check: `GET /health`
- Register user: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Use bearer token on admin-protected endpoints.
