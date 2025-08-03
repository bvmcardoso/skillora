from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session 
from app.infrastructure.db import get_db 
from app.skills import schemas, services

router = APIRouter(tags=["Skills"])

@router.post("/", response_model = schemas.SkillOut, status_code=status.HTTP_201_CREATED)
async def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    return services.create_skill(db, skill)

@router.get("/", response_model = list[schemas.SkillOut])    
async def get_skills(db: Session = Depends(get_db)):
    return services.get_all_skills(db)


