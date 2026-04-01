# LamaCop Full Stack - Quick Start Guide

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Frontend (Next.js + React + TailwindCSS)               │
│  Port: 80 (via Nginx)  / 3000 (dev)                     │
│                                                           │
│              ↓ API Calls (http://localhost:8000)        │
│                                                           │
│  Backend (FastAPI + SQLAlchemy)                         │
│  Port: 8000                                              │
│                                                           │
│              ↓ Database Queries                          │
│                                                           │
│  MySQL Database (lamacop)                               │
│  Port: 3306                                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Option 1: Docker Compose (Recommended for Full Stack)

Run all services (MySQL + Backend + Frontend) with one command:

```bash
# From project root
docker-compose up -d

# Or with custom environment
docker-compose --env-file .env.compose up -d
```

### Check Services
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend

# Check status
docker-compose ps

# Stop services
docker-compose down
```

### Access Services
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MySQL**: localhost:3306 (user: lamacop_user, pass: lamacop_pass)

---

## Option 2: Backend Only (Local Development)

Run backend locally while using your existing MySQL database.

### Prerequisites
- Python 3.11+
- MySQL already running with database named "lamacop"

### Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# Example:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=lamacop
```

### Run Backend
```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Test API
```bash
# Health check
curl http://localhost:8000/health

# Get all users
curl http://localhost:8000/api/v1/users

# View API documentation
# Open browser: http://localhost:8000/docs
```

---

## Option 3: Backend Docker Only

Build and run backend container separately:

```bash
cd backend

# Build image
docker build -t lamacop-backend:latest .

# Run container (connecting to your MySQL)
docker run -d \
  --name lamacop-backend \
  -p 8000:8000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD=your_password \
  -e DB_NAME=lamacop \
  -e FRONTEND_URL=http://localhost:3000 \
  --restart unless-stopped \
  lamacop-backend:latest

# Check logs
docker logs -f lamacop-backend

# Stop container
docker stop lamacop-backend
```

---

## Frontend Setup (Next.js)

### Local Development

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Access
- **Dev**: http://localhost:3000
- **Docs**: http://localhost:3000/api

---

## Database Connection

### From MySQL CLI

```bash
# Connect to database
mysql -h localhost -u lamacop_user -p -D lamacop

# Verify tables
SHOW TABLES;

# Check users
SELECT * FROM users;
```

### From Python (Direct Connection)

```python
from app.database import SessionLocal, User

db = SessionLocal()
users = db.query(User).all()
print(users)
db.close()
```

---

## API Usage Examples

### 1. Create a User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "researcher@lamacop.com",
    "name": "Dr. Ahmed",
    "password": "secure_password_123",
    "role": "researcher",
    "bio": "Expert in quantum computing",
    "image_url": "https://example.com/avatar.jpg"
  }'
```

### 2. Create a Research Project
```bash
curl -X POST http://localhost:8000/api/v1/research \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Algorithm Development",
    "description": "Development of novel quantum algorithms",
    "image_url": "https://example.com/research.jpg",
    "created_by": 1
  }'
```

### 3. Get All Research Projects
```bash
curl http://localhost:8000/api/v1/research?skip=0&limit=10
```

### 4. Create a Team Member
```bash
curl -X POST http://localhost:8000/api/v1/team \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah",
    "position": "Research Lead",
    "bio": "PhD in Computer Science",
    "image_url": "https://example.com/sarah.jpg",
    "created_by": 1
  }'
```

### 5. Get News with Filter
```bash
curl "http://localhost:8000/api/v1/news?category=announcement&skip=0&limit=5"
```

---

## Frontend Integration

### Update Frontend API Calls

Create `frontend/src/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getResearchProjects() {
  const res = await fetch(`${API_BASE}/research`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function createResearchProject(data: any) {
  const res = await fetch(`${API_BASE}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, created_by: 1 })
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

export async function getTeamMembers() {
  const res = await fetch(`${API_BASE}/team`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function getNews(category?: string) {
  const url = new URL(`${API_BASE}/news`);
  if (category) url.searchParams.append("category", category);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
```

### Use in Components

```typescript
// frontend/src/app/research/page.tsx
import { getResearchProjects } from "@/lib/api";

export default async function ResearchPage() {
  const projects = await getResearchProjects();

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <div key={project.id} className="p-4 border rounded">
          <h2>{project.title}</h2>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Backend Won't Start
```
Error: Failed to connect to MySQL
```
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `CREATE DATABASE lamacop;`
- Verify .env credentials match your MySQL setup

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
- Edit `backend/app/main.py` and add your frontend URL to `allow_origins`
- Or use `"*"` for development (NOT for production)

### Port Already in Use
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Docker Can't Connect to MySQL
- If MySQL is on host machine, use `host.docker.internal:3306` instead of `localhost:3306`
- Or run MySQL in Docker using docker-compose

---

## Deployment to Azure VM

### 1. SSH to VM
```bash
ssh username@your_vm_ip
```

### 2. Clone Repository
```bash
git clone https://github.com/RaedAffes/LamaCop-.git
cd LamaCop-
```

### 3. Set Up Environment
```bash
cp .env.compose .env
# Edit .env with Azure MySQL credentials
```

### 4. Start Services
```bash
docker-compose up -d
```

### 5. Configure Azure
- Add NSG inbound rule: Allow TCP 80 (HTTP) and 8000 (API)
- Or use Azure Application Gateway for HTTPS/load balancing

### 6. Domain Setup (Optional)
- Point DNS domain to VM IP
- Install SSL certificate: `sudo certbot certonly --standalone -d yourdomain.com`
- Update Nginx to use HTTPS

---

## Development Checklist

- [x] Backend: FastAPI with CRUD routes for all 6 tables
- [x] Database: SQLAlchemy ORM with MySQL
- [x] Frontend: Next.js static export
- [x] Docker: Multi-stage builds for both frontend & backend
- [ ] Auth: JWT/session-based authentication
- [ ] Image Upload: Azure Blob Storage integration
- [ ] Testing: Unit & integration tests
- [ ] CI/CD: GitHub Actions for automated deployment
- [ ] Monitoring: Logging, error tracking, analytics

---

## Support

For issues or questions:
1. Check [backend/README.md](backend/README.md)
2. Check [frontend/README.md](frontend/README.md)
3. Review API docs at: http://localhost:8000/docs
4. Check logs: `docker-compose logs -f`

Enjoy building! 🚀
