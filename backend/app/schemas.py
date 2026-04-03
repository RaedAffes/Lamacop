from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    team = "team"
    user = "user"


class AccountStatus(str, Enum):
    active = "active"
    pending = "pending"


class ItemStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    archived = "archived"


class NewsCategory(str, Enum):
    research = "research"
    event = "event"
    announcement = "announcement"
    achievement = "achievement"


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    institution: Optional[str] = None
    role: UserRole = UserRole.user
    status: AccountStatus = AccountStatus.active


class UserCreate(UserBase):
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[AccountStatus] = None


class UserPasswordUpdate(BaseModel):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Research Project Schemas
class ResearchProjectBase(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None


class ResearchProjectCreate(ResearchProjectBase):
    pass


class ResearchProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class ResearchProject(ResearchProjectBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Team Member Schemas
class TeamMemberBase(BaseModel):
    name: str
    position: str
    bio: Optional[str] = None
    image_url: Optional[str] = None


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None


class TeamMember(TeamMemberBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Publication Schemas
class PublicationBase(BaseModel):
    title: str
    authors: str
    description: str
    image_url: Optional[str] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class Publication(PublicationBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Equipment Item Schemas
class EquipmentItemBase(BaseModel):
    name: str
    description: str
    status: ItemStatus = ItemStatus.active
    image_url: Optional[str] = None


class EquipmentItemCreate(EquipmentItemBase):
    pass


class EquipmentItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ItemStatus] = None
    image_url: Optional[str] = None


class EquipmentItem(EquipmentItemBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# News Item Schemas
class NewsItemBase(BaseModel):
    title: str
    content: str
    category: NewsCategory
    image_url: Optional[str] = None


class NewsItemCreate(NewsItemBase):
    pass


class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[NewsCategory] = None
    image_url: Optional[str] = None


class NewsItem(NewsItemBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
