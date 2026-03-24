from pydantic import BaseModel, Field


class ServiceOut(BaseModel):
    id: int
    title: str
    description: str

    class Config:
        from_attributes = True


class ServiceCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=10, max_length=3000)
