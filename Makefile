.PHONY: help build up down logs clean restart migrate collectstatic createsuperuser shell test backup restore

# Default target
help:
	@echo "Available commands:"
	@echo "  make build          - Build all Docker images"
	@echo "  make up             - Start all services (production)"
	@echo "  make up-dev         - Start all services (development)"
	@echo "  make down           - Stop all services"
	@echo "  make logs           - View all logs"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make restart        - Restart all services"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make makemigrations - Create Django migrations"
	@echo "  make collectstatic  - Collect static files"
	@echo "  make createsuperuser- Create Django superuser"
	@echo "  make shell          - Access Django shell"
	@echo "  make test           - Run tests"
	@echo "  make clean          - Clean up containers and volumes"
	@echo "  make backup         - Backup database"
	@echo "  make restore        - Restore database from backup"

# Build all images
build:
	docker-compose build

# Start production environment
up:
	docker-compose up -d

# Start development environment
up-dev:
	docker-compose -f docker-compose.dev.yml up -d

# Stop all services
down:
	docker-compose down

# Stop development services
down-dev:
	docker-compose -f docker-compose.dev.yml down

# View all logs
logs:
	docker-compose logs -f

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View frontend logs
logs-frontend:
	docker-compose logs -f frontend

# Restart all services
restart:
	docker-compose restart

# Run Django migrations
migrate:
	docker-compose exec backend python manage.py migrate

# Create Django migrations
makemigrations:
	docker-compose exec backend python manage.py makemigrations

# Collect static files
collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

# Create Django superuser
createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

# Access Django shell
shell:
	docker-compose exec backend python manage.py shell

# Run Django tests
test:
	docker-compose exec backend python manage.py test

# Run frontend tests
test-frontend:
	docker-compose exec frontend npm test

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Full reset (⚠️ This will delete all data!)
reset:
	docker-compose down -v --rmi all
	docker system prune -a -f

# Backup database
backup:
	docker-compose exec db pg_dump -U lms_user lms_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restore database (requires BACKUP_FILE variable)
restore:
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE=filename.sql"; exit 1; fi
	docker-compose exec -T db psql -U lms_user lms_db < $(BACKUP_FILE)

# Install frontend dependencies
install-frontend:
	docker-compose exec frontend npm install

# Install backend dependencies
install-backend:
	docker-compose exec backend pip install -r requirements.txt

# Check service status
status:
	docker-compose ps

# View resource usage
stats:
	docker stats

# Setup development environment
setup-dev:
	cp backend/env.example backend/.env
	docker-compose -f docker-compose.dev.yml up -d --build
	docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
	@echo "Development environment is ready!"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend: http://localhost:8000"
	@echo "Admin: http://localhost:8000/admin (admin@example.com / admin123)"

# Setup production environment
setup-prod:
	@echo "Setting up production environment..."
	@echo "Please edit backend/.env with your production values"
	cp backend/env.example backend/.env
	docker-compose up -d --build
	@echo "Production environment is ready!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "Nginx: http://localhost:8080"
