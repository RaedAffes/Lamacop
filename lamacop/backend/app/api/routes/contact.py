from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactOut


router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> dict:
    try:
        contact = Contact(name=payload.name, email=payload.email, message=payload.message)
        db.add(contact)
        db.commit()
        return {"message": "Contact request submitted successfully"}
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error") from exc


@router.get("", response_model=list[ContactOut], dependencies=[Depends(require_admin)])
def list_contacts(db: Session = Depends(get_db)) -> list[Contact]:
    return db.query(Contact).order_by(Contact.created_at.desc()).all()
