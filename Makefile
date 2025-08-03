# Run bash inside container:
exec: 
	docker compose exec backend bash

# Start containers:
up:
	docker compose up -d

# Stop containers:
down:
	docker compose down

build:
	docker compose down
	docker compose up -d --build

build-no-cache:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

logs:
	docker compose logs -f backend

# Full reset:
reset:
	docker compose down -v
	docker compose up -d --build 

# Create a new migration:
migrate-create:
	docker compose exec backend alembic revision --autogenerate -m "$(name)"

# Apply all migrations:
migrate-up:
	docker compose exec backend alembic upgrade head

# Revert last migration:
migrate-down:
	docker compose exec backend alembic downgrade -1

# Show current migration:
migrate-status:
	docker compose exec backend alembic current

# Open psql shell:
psql: 
	docker compose exec db psql -U postgres -d skillora_db
