.PHONY: help build up down restart logs clean test seed init

# Colors for better readability
BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Affiche l'aide
	@echo "$(BLUE)=== Intelligent Study Assistant - Docker Commands ===$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Build les images Docker
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build

up: ## Démarre les conteneurs
	@echo "$(BLUE)Starting containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Containers started successfully!$(NC)"
	@echo "Backend: http://localhost:5000"
	@echo "Frontend: http://localhost:5173"

up-logs: ## Démarre les conteneurs avec logs
	@echo "$(BLUE)Starting containers with logs...$(NC)"
	docker-compose up

down: ## Arrête les conteneurs
	@echo "$(RED)Stopping containers...$(NC)"
	docker-compose down

restart: down up ## Redémarre les conteneurs

logs: ## Affiche les logs
	docker-compose logs -f

logs-backend: ## Affiche les logs du backend
	docker-compose logs -f backend

logs-frontend: ## Affiche les logs du frontend
	docker-compose logs -f frontend

logs-db: ## Affiche les logs de la base de données
	docker-compose logs -f db

ps: ## Liste les conteneurs en cours d'exécution
	docker-compose ps

shell-backend: ## Ouvre un shell dans le conteneur backend
	docker-compose exec backend /bin/bash

shell-db: ## Ouvre un shell PostgreSQL
	docker-compose exec db psql -U study_user -d study_assistant_db

clean: ## Nettoie les conteneurs, volumes et images
	@echo "$(RED)Cleaning up...$(NC)"
	docker-compose down -v
	docker system prune -f

clean-all: ## Nettoie tout (conteneurs, volumes, images, cache)
	@echo "$(RED)Deep cleaning...$(NC)"
	docker-compose down -v --rmi all
	docker system prune -af

init: ## Initialise la base de données
	@echo "$(BLUE)Initializing database...$(NC)"
	docker-compose exec backend python init_db.py init
	@echo "$(GREEN)Database initialized!$(NC)"

seed: ## Remplit la base de données avec des données de test
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose exec backend python seed_data.py
	@echo "$(GREEN)Database seeded!$(NC)"

reset: ## Réinitialise complètement la base de données
	@echo "$(RED)Resetting database...$(NC)"
	docker-compose exec backend python init_db.py reset
	@echo "$(GREEN)Database reset!$(NC)"

migrate: ## Exécute les migrations de base de données
	@echo "$(BLUE)Running migrations...$(NC)"
	docker-compose exec backend flask db upgrade
	@echo "$(GREEN)Migrations completed!$(NC)"

test: ## Exécute les tests
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose exec backend pytest
	@echo "$(GREEN)Tests completed!$(NC)"

install: build init seed ## Installation complète (build + init + seed)
	@echo "$(GREEN)Installation completed!$(NC)"
	@echo ""
	@echo "$(BLUE)Access the application:$(NC)"
	@echo "  Backend:  http://localhost:5000"
	@echo "  Frontend: http://localhost:5173"
	@echo ""
	@echo "$(BLUE)Test accounts:$(NC)"
	@echo "  Sirine: sirine.abdelkhalek@test.com / Sirine1234"
	@echo "  Safa:   safa.elmathlouthi@test.com / Safa1234"
	@echo "  Admin:  admin@test.com / Admin1234"

dev: ## Mode développement (up + logs)
	docker-compose up

prod: ## Démarre en mode production
	docker-compose -f docker-compose.prod.yml up -d

backup-db: ## Sauvegarde la base de données
	@echo "$(BLUE)Backing up database...$(NC)"
	docker-compose exec -T db pg_dump -U study_user study_assistant_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backed up!$(NC)"

restore-db: ## Restaure la base de données (usage: make restore-db FILE=backup.sql)
	@echo "$(BLUE)Restoring database...$(NC)"
	docker-compose exec -T db psql -U study_user study_assistant_db < $(FILE)
	@echo "$(GREEN)Database restored!$(NC)"

check: ## Vérifie l'état des services
	@echo "$(BLUE)Checking services...$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)Backend health:$(NC)"
	@curl -f http://localhost:5000/api/health || echo "Backend not responding"
	@echo ""
	@echo "$(BLUE)Database connection:$(NC)"
	@docker-compose exec backend python init_db.py check || echo "Database connection failed"

update: ## Met à jour les dépendances
	@echo "$(BLUE)Updating dependencies...$(NC)"
	docker-compose exec backend pip install -r requirements.txt
	@echo "$(GREEN)Dependencies updated!$(NC)"