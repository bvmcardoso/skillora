from sqlalchemy.orm import Session
from app.skills import models, schemas

async def create_skill(db: Session, skill: schemas.SkillCreate):
    skill = models.Skill(name=skill.name)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

async def get_all_skills(db: Session):
    return db.query(models.Skill).all()
