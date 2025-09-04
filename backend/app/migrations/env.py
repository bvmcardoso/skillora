# app/migrations/env.py
import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context

# ---- Bootstrapping do path / .env ----
from dotenv import load_dotenv
from sqlalchemy import MetaData, pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

load_dotenv()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ---- App imports (Base + models para o autogenerate “ver”) ----
from app.infrastructure.db import Base  # declarative_base()
from app.users.models import User

# Importa aqui outros models que EXISTEM hoje no schema (não importe mais Skill)

# ---- Alembic config ----
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata: MetaData = Base.metadata

# ---- Monta URL assíncrona via settings ----
from app.core.config import settings

ASYNC_DB_URL = (
    f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

# Para modo offline o Alembic aceita URL async — mas se preferir, pode montar uma sync aqui.
config.set_main_option("sqlalchemy.url", ASYNC_DB_URL)


def run_migrations_offline() -> None:
    """Gera SQL sem conectar (offline)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _run_sync_migrations(connection: Connection) -> None:
    """Executa migrations usando a conexão síncrona exposta pelo run_sync."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Conecta com engine assíncrono e roda migrations."""
    connectable: AsyncEngine = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(_run_sync_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
