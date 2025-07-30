from sqlalchemy.orm import Session
from app.skills import models, schemas

def create_skill(db: Session, skill: schemas.SkillCreate):
    skill = models.Skill(name=skill.name)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

def get_all_skills(db: Session):
    return db.query(models.Skill).all()
