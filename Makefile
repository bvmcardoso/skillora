# Run the containers
up:
	docker compose up --build -d

# Stop containers:
down:
	docker compose down

# Rebuild the project and run the containers:
rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Run bash inside backend container:
exec: 
	docker compose exec backend bash

# Open psql shell:
psql: 
	docker compose exec db psql -U postgres -d skillora_db

# Application logs:
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

