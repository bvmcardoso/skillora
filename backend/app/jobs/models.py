from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.sql import func
from app.infrastructure.db import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), nullable=False, index=True)
    stack = Column(String(128), index=True)
    seniority = Column(String(64), index=True)
    country = Column(String(64), index=True)
    salary = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    source = Column(String(64), default="upload")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


Index("ix_jobs_title_stack_seniority_country", Job.title, Job.stack, Job.country)
