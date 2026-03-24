from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Contact, Project, Service, User


app = FastAPI(title=settings.project_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Service).count() == 0:
            db.add_all(
                [
                    Service(title="Materials Testing", description="Mechanical, thermal, and chemical analysis of ceramic and polymer composites."),
                    Service(title="Research Collaboration", description="Collaborative R&D programs for advanced composite applications."),
                    Service(title="Consulting", description="Expert consultancy for formulation, process optimization, and quality control."),
                ]
            )

        if db.query(Project).count() == 0:
            db.add_all(
                [
                    Project(title="High-Temperature Ceramic Matrix", description="Developing durable ceramic matrices for extreme thermal environments."),
                    Project(title="Polymer Reinforcement Study", description="Investigating nano-reinforcements for improved polymer composite performance."),
                ]
            )
        db.commit()
    except SQLAlchemyError:
        db.rollback()
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.api_v1_prefix)
