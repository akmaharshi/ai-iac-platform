.PHONY: help backend-up backend-down backend-rebuild backend-logs ui-install ui-dev ui-build clean debug

# Detect which docker compose command to use
DOCKER_COMPOSE := $(shell command -v docker-compose 2> /dev/null)
ifndef DOCKER_COMPOSE
    DOCKER_COMPOSE := docker compose
endif

help:
	@echo "AI IaC Platform - Available Commands"
	@echo "====================================="
	@echo ""
	@echo "Backend Commands:"
	@echo "  make backend-up       - Start backend services"
	@echo "  make backend-down     - Stop backend services"
	@echo "  make backend-rebuild  - Rebuild and restart backend"
	@echo "  make backend-logs     - View backend logs"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make ui-install       - Install frontend dependencies"
	@echo "  make ui-dev           - Start frontend dev server"
	@echo "  make ui-build         - Build frontend for production"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make debug            - Run diagnostic checks"
	@echo "  make clean            - Stop all services and cleanup"
	@echo "  make health           - Check service health"
	@echo ""

backend-up:
	@echo "Starting backend services..."
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) up --build -d
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Backend services started!"
	@echo "API Gateway: http://localhost:8000"
	@echo "Vision AI: http://localhost:8001"
	@echo ""
	@echo "Check health: make health"

backend-down:
	@echo "Stopping backend services..."
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) down
	@echo "Backend services stopped"

backend-rebuild:
	@echo "Rebuilding backend services..."
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) down
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) build --no-cache
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) up -d
	@echo "Backend rebuilt and restarted"

backend-logs:
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) logs -f

ui-install:
	@echo "Installing frontend dependencies..."
	cd ai-iac-platform/apps/idp-ui && npm install
	@echo "Frontend dependencies installed"

ui-dev:
	@echo "Starting frontend development server..."
	@echo "Frontend will be available at: http://localhost:5173"
	cd ai-iac-platform/apps/idp-ui && npm run dev

ui-build:
	@echo "Building frontend for production..."
	cd ai-iac-platform/apps/idp-ui && npm run build
	@echo "Frontend built successfully"

health:
	@echo "Checking service health..."
	@echo ""
	@echo "API Gateway:"
	@curl -s http://localhost:8000/health || echo "❌ Not responding"
	@echo ""
	@echo ""
	@echo "Vision AI:"
	@curl -s http://localhost:8001/ > /dev/null 2>&1 && echo '{"status":"ok"}' || echo "❌ Not responding"
	@echo ""

debug:
	@echo "Running diagnostic checks..."
	@./debug.sh

clean:
	@echo "Stopping all services..."
	cd ai-iac-platform/infra && $(DOCKER_COMPOSE) down -v
	@echo "All services stopped and volumes removed"

.DEFAULT_GOAL := help
