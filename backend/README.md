# LamaCop FastAPI Backend

FastAPI backend for the LamaCop Research Lab application. Connects Next.js frontend to MySQL database.

## Features

- ✅ RESTful API for all 6 data models (Users, Research, Team, Publications, Equipment, News)
- ✅ SQLAlchemy ORM with MySQL support
- ✅ Pydantic validation for request/response schemas
- ✅ CORS enabled for frontend communication
- ✅ Docker containerization with multi-stage build
- ✅ Environment variable configuration

## Prerequisites

- Python 3.11+
- MySQL database (local or Azure DB for MySQL)
- pip or conda

## Local Development Setup

### 1. Create Python Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306
DB_NAME=lamacop
FRONTEND_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`
API docs (Swagger): `http://localhost:8000/docs`

## Docker Deployment

### Build Docker Image

```bash
docker build -t lamacop-backend:latest .
```

### Run Docker Container

```bash
docker run -d \
  --name lamacop-backend \
  -p 8000:8000 \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=lamacop \
  -e FRONTEND_URL=http://your_frontend_domain \
  --restart unless-stopped \
  lamacop-backend:latest
```

## API Endpoints

### Base URL
`http://api.example.com/api/v1`

### Users
- `GET /users` - Get all users (paginated)
- `GET /users/{user_id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Research Projects
- `GET /research` - Get all research projects
- `GET /research/{project_id}` - Get research project by ID
- `POST /research` - Create new project
- `PUT /research/{project_id}` - Update project
- `DELETE /research/{project_id}` - Delete project

### Team Members
- `GET /team` - Get all team members
- `GET /team/{member_id}` - Get team member by ID
- `POST /team` - Create new team member
- `PUT /team/{member_id}` - Update team member
- `DELETE /team/{member_id}` - Delete team member

### Publications
- `GET /publications` - Get all publications
- `GET /publications/{pub_id}` - Get publication by ID
- `POST /publications` - Create new publication
- `PUT /publications/{pub_id}` - Update publication
- `DELETE /publications/{pub_id}` - Delete publication

### Equipment
- `GET /equipment` - Get all equipment items
- `GET /equipment/{item_id}` - Get equipment item by ID
- `POST /equipment` - Create new equipment item
- `PUT /equipment/{item_id}` - Update equipment item
- `DELETE /equipment/{item_id}` - Delete equipment item

### News
- `GET /news` - Get all news items (optional: filter by `?category=research`)
- `GET /news/{news_id}` - Get news item by ID
- `POST /news` - Create new news item
- `PUT /news/{news_id}` - Update news item
- `DELETE /news/{news_id}` - Delete news item

## Example Requests

### Create a Research Project
```bash
curl -X POST http://localhost:8000/api/v1/research \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum Computing",
    "description": "Research on quantum algorithms",
    "image_url": "https://example.com/image.jpg",
    "created_by": 1
  }'
```

### Get All Research Projects
```bash
curl http://localhost:8000/api/v1/research?skip=0&limit=10
```

### Create a Team Member
```bash
curl -X POST http://localhost:8000/api/v1/team \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Ahmed",
    "position": "Lead Researcher",
    "bio": "Expert in quantum computing",
    "image_url": "https://example.com/avatar.jpg",
    "created_by": 1
  }'
```

## Database Models

All models include:
- Auto-incrementing `id` (primary key)
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated
- `created_by` - Foreign key to users table

### Users
- `email` (unique)
- `name`
- `password_hash`
- `role` (student|researcher|professor|admin)
- `bio` (optional)
- `image_url` (optional)

### Research Projects
- `title`
- `description`
- `image_url` (optional)

### Team Members
- `name`
- `position`
- `bio` (optional)
- `image_url` (optional)

### Publications
- `title`
- `authors`
- `description`
- `image_url` (optional)

### Equipment Items
- `name`
- `description`
- `status` (active|inactive|archived)
- `image_url` (optional)

### News Items
- `title`
- `content`
- `category` (research|event|announcement|achievement)
- `image_url` (optional)

## Connecting Frontend to Backend

Update your Next.js frontend API calls:

```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getResearchProjects() {
  const response = await fetch(`${API_BASE_URL}/research`);
  return response.json();
}

export async function createResearchProject(data) {
  const response = await fetch(`${API_BASE_URL}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, created_by: 1 }) // Replace with actual user ID
  });
  return response.json();
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | MySQL host |
| `DB_USER` | root | MySQL user |
| `DB_PASSWORD` | password | MySQL password |
| `DB_PORT` | 3306 | MySQL port |
| `DB_NAME` | lamacop | Database name |
| `DEBUG` | True | Debug mode |
| `API_PREFIX` | /api/v1 | API prefix |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL (for CORS) |

## Troubleshooting

### Connection Error
```
Connection refused to database
```
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify MySQL is running and database exists

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
- Add frontend URL to `FRONTEND_URL` in .env
- Verify CORS middleware is enabled in `app/main.py`

### Port Already in Use
```bash
# Find and kill process using port 8000
lsof -i :8000
kill -9 <PID>
```

## Development Notes

- All routes require `created_by` parameter (except GET queries)
- Pagination: use `skip` and `limit` query parameters
- Images: store full URLs in `image_url` fields (prepare for Azure Blob Storage integration)
- Passwords: currently stored as-is (TODO: implement bcrypt hashing)
- Authentication: build JWT/session system before going to production

## Next Steps

1. ✅ FastAPI backend with CRUD routes
2. ⏳ Implement password hashing (bcrypt)
3. ⏳ Add JWT authentication
4. ⏳ Integrate Azure Blob Storage for images
5. ⏳ Add pagination and filtering
6. ⏳ Implement admin dashboard
