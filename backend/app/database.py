from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from enum import Enum as PyEnum
from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums
class UserRole(str, PyEnum):
    student = "student"
    researcher = "researcher"
    professor = "professor"
    admin = "admin"


class ItemStatus(str, PyEnum):
    active = "active"
    inactive = "inactive"
    archived = "archived"


class NewsCategory(str, PyEnum):
    research = "research"
    event = "event"
    announcement = "announcement"
    achievement = "achievement"


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    bio = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class ResearchProject(Base):
    __tablename__ = "research_projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    authors = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class EquipmentItem(Base):
    __tablename__ = "equipment_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ItemStatus), nullable=False, default=ItemStatus.active)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class NewsItem(Base):
    __tablename__ = "news_items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(Enum(NewsCategory), nullable=False)
    image_url = Column(String(255), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db() -> Session:
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
