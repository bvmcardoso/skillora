import sys, os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add full path to backend/app to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_DIR)

# Optional debug logs
# print("APP_DIR:", APP_DIR)
# print("sys.path:", sys.path)

from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig

from app.infrastructure.db import Base
from app.users.models import User
from app.core.config import settings

# Alembic Config object (from alembic.ini)
config = context.config

# Set up loggers
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

# Metadata used for autogeneration of migrations
target_metadata = Base.metadata

# Set database URL from environment
config.set_main_option(
    "sqlalchemy.url",
    f"postgresql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (SQL output only)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to DB)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

# Choose offline or online mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
