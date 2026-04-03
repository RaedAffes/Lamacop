from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app.config import get_settings
from app.database import (
    get_db, Base, init_db,
    User, ResearchProject, TeamMember, Publication, EquipmentItem, NewsItem
)
from app import schemas
from app.security import hash_password, verify_password

settings = get_settings()
app = FastAPI(
    title="LamaCop API",
    description="Backend API for LamaCop Research Lab",
    version="1.0.0"
)

init_db()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:80",
        "*"  # For development; restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "LamaCop API is running"}


# ==================== Users ====================
@app.get(f"{settings.api_prefix}/users", response_model=List[schemas.User])
def get_users(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.get(f"{settings.api_prefix}/users/{{user_id}}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get(f"{settings.api_prefix}/users/by-email/{{email}}", response_model=schemas.User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """Get user by email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post(f"{settings.api_prefix}/auth/login", response_model=schemas.User)
def login_user(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user against the database"""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password_hash != payload.password:
        raise HTTPException(status_code=401, detail="Invalid password")
    return user


@app.post(f"{settings.api_prefix}/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create new user"""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        institution=user.institution,
        password_hash=hash_password(user.password),
        role=user.role,
        status=user.status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post(f"{settings.api_prefix}/auth/login", response_model=schemas.LoginResponse)


@app.put(f"{settings.api_prefix}/users/{{user_id}}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.first_name is not None:
        db_user.first_name = user.first_name
    if user.last_name is not None:
        db_user.last_name = user.last_name
    if user.institution is not None:
        db_user.institution = user.institution
    if user.role is not None:
        db_user.role = user.role
    if user.status is not None:
        db_user.status = user.status
    
    db.commit()
    db.refresh(db_user)
    return db_user


@app.put(f"{settings.api_prefix}/users/{{user_id}}/password", response_model=schemas.User)
def update_user_password(
    user_id: int,
    payload: schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
):
    """Update user password"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.password_hash = payload.password
    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete(f"{settings.api_prefix}/users/{{user_id}}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(ResearchProject).filter(ResearchProject.created_by == user_id).delete(synchronize_session=False)
    db.query(TeamMember).filter(TeamMember.created_by == user_id).delete(synchronize_session=False)
    db.query(Publication).filter(Publication.created_by == user_id).delete(synchronize_session=False)
    db.query(EquipmentItem).filter(EquipmentItem.created_by == user_id).delete(synchronize_session=False)
    db.query(NewsItem).filter(NewsItem.created_by == user_id).delete(synchronize_session=False)
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}


# ==================== Research Projects ====================
@app.get(f"{settings.api_prefix}/research", response_model=List[schemas.ResearchProject])
def get_research_projects(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Get all research projects"""
    projects = db.query(ResearchProject).offset(skip).limit(limit).all()
    return projects


@app.get(f"{settings.api_prefix}/research/{{project_id}}", response_model=schemas.ResearchProject)
def get_research_project(project_id: int, db: Session = Depends(get_db)):
    """Get research project by ID"""
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found")
    return project


@app.post(f"{settings.api_prefix}/research", response_model=schemas.ResearchProject)
def create_research_project(project: schemas.ResearchProjectCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    """Create new research project"""
    user = db.query(User).filter(User.id == created_by).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_project = ResearchProject(
        title=project.title,
        description=project.description,
        image_url=project.image_url,
        created_by=created_by
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.put(f"{settings.api_prefix}/research/{{project_id}}", response_model=schemas.ResearchProject)
def update_research_project(project_id: int, project: schemas.ResearchProjectUpdate, db: Session = Depends(get_db)):
    """Update research project"""
    db_project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Research project not found")
    
    if project.title:
        db_project.title = project.title
    if project.description:
        db_project.description = project.description
    if project.image_url:
        db_project.image_url = project.image_url
    
    db.commit()
    db.refresh(db_project)
    return db_project


@app.delete(f"{settings.api_prefix}/research/{{project_id}}")
def delete_research_project(project_id: int, db: Session = Depends(get_db)):
    """Delete research project"""
    db_project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Research project not found")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Research project deleted"}


# ==================== Team Members ====================
@app.get(f"{settings.api_prefix}/team", response_model=List[schemas.TeamMember])
def get_team_members(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Get all team members"""
    members = db.query(TeamMember).offset(skip).limit(limit).all()
    return members


@app.get(f"{settings.api_prefix}/team/{{member_id}}", response_model=schemas.TeamMember)
def get_team_member(member_id: int, db: Session = Depends(get_db)):
    """Get team member by ID"""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member


@app.post(f"{settings.api_prefix}/team", response_model=schemas.TeamMember)
def create_team_member(member: schemas.TeamMemberCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    """Create new team member"""
    user = db.query(User).filter(User.id == created_by).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_member = TeamMember(
        name=member.name,
        position=member.position,
        bio=member.bio,
        image_url=member.image_url,
        created_by=created_by
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@app.put(f"{settings.api_prefix}/team/{{member_id}}", response_model=schemas.TeamMember)
def update_team_member(member_id: int, member: schemas.TeamMemberUpdate, db: Session = Depends(get_db)):
    """Update team member"""
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member.name:
        db_member.name = member.name
    if member.position:
        db_member.position = member.position
    if member.bio is not None:
        db_member.bio = member.bio
    if member.image_url:
        db_member.image_url = member.image_url
    
    db.commit()
    db.refresh(db_member)
    return db_member


@app.delete(f"{settings.api_prefix}/team/{{member_id}}")
def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    """Delete team member"""
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    db.delete(db_member)
    db.commit()
    return {"message": "Team member deleted"}


# ==================== Publications ====================
@app.get(f"{settings.api_prefix}/publications", response_model=List[schemas.Publication])
def get_publications(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Get all publications"""
    publications = db.query(Publication).offset(skip).limit(limit).all()
    return publications


@app.get(f"{settings.api_prefix}/publications/{{pub_id}}", response_model=schemas.Publication)
def get_publication(pub_id: int, db: Session = Depends(get_db)):
    """Get publication by ID"""
    pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return pub


@app.post(f"{settings.api_prefix}/publications", response_model=schemas.Publication)
def create_publication(pub: schemas.PublicationCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    """Create new publication"""
    user = db.query(User).filter(User.id == created_by).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_pub = Publication(
        title=pub.title,
        authors=pub.authors,
        description=pub.description,
        image_url=pub.image_url,
        created_by=created_by
    )
    db.add(new_pub)
    db.commit()
    db.refresh(new_pub)
    return new_pub


@app.put(f"{settings.api_prefix}/publications/{{pub_id}}", response_model=schemas.Publication)
def update_publication(pub_id: int, pub: schemas.PublicationUpdate, db: Session = Depends(get_db)):
    """Update publication"""
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    if pub.title:
        db_pub.title = pub.title
    if pub.authors:
        db_pub.authors = pub.authors
    if pub.description:
        db_pub.description = pub.description
    if pub.image_url:
        db_pub.image_url = pub.image_url
    
    db.commit()
    db.refresh(db_pub)
    return db_pub


@app.delete(f"{settings.api_prefix}/publications/{{pub_id}}")
def delete_publication(pub_id: int, db: Session = Depends(get_db)):
    """Delete publication"""
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    db.delete(db_pub)
    db.commit()
    return {"message": "Publication deleted"}


# ==================== Equipment ====================
@app.get(f"{settings.api_prefix}/equipment", response_model=List[schemas.EquipmentItem])
def get_equipment(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Get all equipment items"""
    items = db.query(EquipmentItem).offset(skip).limit(limit).all()
    return items


@app.get(f"{settings.api_prefix}/equipment/{{item_id}}", response_model=schemas.EquipmentItem)
def get_equipment_item(item_id: int, db: Session = Depends(get_db)):
    """Get equipment item by ID"""
    item = db.query(EquipmentItem).filter(EquipmentItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment item not found")
    return item


@app.post(f"{settings.api_prefix}/equipment", response_model=schemas.EquipmentItem)
def create_equipment_item(item: schemas.EquipmentItemCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    """Create new equipment item"""
    user = db.query(User).filter(User.id == created_by).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_item = EquipmentItem(
        name=item.name,
        description=item.description,
        status=item.status,
        image_url=item.image_url,
        created_by=created_by
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@app.put(f"{settings.api_prefix}/equipment/{{item_id}}", response_model=schemas.EquipmentItem)
def update_equipment_item(item_id: int, item: schemas.EquipmentItemUpdate, db: Session = Depends(get_db)):
    """Update equipment item"""
    db_item = db.query(EquipmentItem).filter(EquipmentItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment item not found")
    
    if item.name:
        db_item.name = item.name
    if item.description:
        db_item.description = item.description
    if item.status:
        db_item.status = item.status
    if item.image_url:
        db_item.image_url = item.image_url
    
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete(f"{settings.api_prefix}/equipment/{{item_id}}")
def delete_equipment_item(item_id: int, db: Session = Depends(get_db)):
    """Delete equipment item"""
    db_item = db.query(EquipmentItem).filter(EquipmentItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Equipment item deleted"}


# ==================== News ====================
@app.get(f"{settings.api_prefix}/news", response_model=List[schemas.NewsItem])
def get_news(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), category: str = Query(None), db: Session = Depends(get_db)):
    """Get all news items, optionally filter by category"""
    query = db.query(NewsItem)
    if category:
        query = query.filter(NewsItem.category == category)
    
    items = query.offset(skip).limit(limit).all()
    return items


@app.get(f"{settings.api_prefix}/news/{{news_id}}", response_model=schemas.NewsItem)
def get_news_item(news_id: int, db: Session = Depends(get_db)):
    """Get news item by ID"""
    item = db.query(NewsItem).filter(NewsItem.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    return item


@app.post(f"{settings.api_prefix}/news", response_model=schemas.NewsItem)
def create_news_item(item: schemas.NewsItemCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    """Create new news item"""
    user = db.query(User).filter(User.id == created_by).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_item = NewsItem(
        title=item.title,
        content=item.content,
        category=item.category,
        image_url=item.image_url,
        created_by=created_by
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@app.put(f"{settings.api_prefix}/news/{{news_id}}", response_model=schemas.NewsItem)
def update_news_item(news_id: int, item: schemas.NewsItemUpdate, db: Session = Depends(get_db)):
    """Update news item"""
    db_item = db.query(NewsItem).filter(NewsItem.id == news_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    if item.title:
        db_item.title = item.title
    if item.content:
        db_item.content = item.content
    if item.category:
        db_item.category = item.category
    if item.image_url:
        db_item.image_url = item.image_url
    
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete(f"{settings.api_prefix}/news/{{news_id}}")
def delete_news_item(news_id: int, db: Session = Depends(get_db)):
    """Delete news item"""
    db_item = db.query(NewsItem).filter(NewsItem.id == news_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "News item deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
