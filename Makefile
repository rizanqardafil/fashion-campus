include .env

APP=docker compose run backend
EXEC=docker compose exec backend
MIGRATE=docker compose run --rm backend poetry run alembic

seed:
	$(EXEC) poetry run python -m app.seeders.seeder
dearchive:
	$(EXEC) poetry run python -m app.util.dearchive
drop-tables:
	$(EXEC) poetry run python -m app.util.drop-tables

download_model:
	docker compose exec backend wget "https://storage.googleapis.com/tutu-startup-campus/model.pth" -O app/image_classification/pipeline/model.pth

create-apptest:
	docker compose exec postgres createdb apptest -U postgres
	docker compose exec postgres psql -U postgres -d apptest -f docker-entrypoint-initdb.d/extension.sql

test:
	docker compose exec backend pytest tests/$(filter-out $@,$(MAKECMDGOALS))

coverage:
	docker compose exec backend coverage run -m pytest tests
	docker compose exec backend coverage report -m

migrate-up:
		$(MIGRATE) upgrade head
migrate-down:
		$(MIGRATE) downgrade -1

create:
		@read -p  "What is the name of migration?" NAME; \
		${MIGRATE} revision --autogenerate -m $$NAME

pre-commit:
		pre-commit run --all-files

docker:
		docker compose -f docker-compose.yml -f docker-compose.prod.yml $(filter-out $@,$(MAKECMDGOALS))
