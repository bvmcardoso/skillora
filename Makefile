REV ?= "auto"

revision:
	docker compose exec backend bash -c "PYTHONPATH=/app alembic revision --autogenerate -m '$(REV)'"

upgrade:
	docker compose exec backend bash -c "PYTHONPATH=/app alembic upgrade head"

downgrade:
	docker compose exec backend bash -c "PYTHONPATH=/app alembic downgrade -1"

history:
	docker compose exec backend bash -c "PYTHONPATH=/app alembic history"

current:
	docker compose exec backend bash -c "PYTHONPATH=/app alembic current"
