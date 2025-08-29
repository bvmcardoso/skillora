# ==========================
# Skillora Makefile
# ==========================

# Run containers
up: ## Start containers (build if needed)
	docker compose up --build -d

down: ## Stop containers
	docker compose down

rebuild: ## Full rebuild (no cache)
	docker compose down
	docker compose build --no-cache
	docker compose up -d

reset: ## Full reset (remove volumes, rebuild)
	docker compose down -v
	docker compose up -d --build

# Shells
exec: ## Open bash inside backend
	docker compose exec backend bash

psql: ## Open PostgreSQL shell
	docker compose exec db psql -U user -d skillora

logs: ## Tail backend logs
	docker compose logs -f backend

# Migrations
migrate-create: ## Create a new migration (usage: make migrate-create name="desc")
	docker compose exec backend alembic revision --autogenerate -m "$(name)"

migrate-up: ## Apply all migrations
	docker compose exec backend alembic upgrade head

migrate-down: ## Revert last migration
	docker compose exec backend alembic downgrade -1

migrate-status: ## Show current migration
	docker compose exec backend alembic current

# Helper
help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'
