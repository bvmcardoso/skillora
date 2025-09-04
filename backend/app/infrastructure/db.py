from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Base class for all models:
Base = declarative_base()

# Create the async engine
DATABASE_URL = settings.database_url
engine = create_async_engine(DATABASE_URL, echo=settings.debug)

async_session = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
