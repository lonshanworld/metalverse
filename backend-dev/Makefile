.PHONY: help build run test clean docker-up docker-down migrate-up migrate-down

help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the application
	go build -o bin/main cmd/api/main.go

run: ## Run the application
	go run cmd/api/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-build: ## Build Docker image
	docker-compose build

docker-logs: ## View logs
	docker-compose logs -f

migrate-up: ## Run database migrations up
	go run cmd/migrate/main.go up

migrate-down: ## Run database migrations down
	go run cmd/migrate/main.go down

migrate-create: ## Create a new migration file (usage: make migrate-create name=create_users_table)
	migrate create -ext sql -dir internal/database/migrations -seq $(name)

deps: ## Download dependencies
	go mod download
	go mod tidy

dev: ## Run in development mode with hot reload (requires air)
	air

install-tools: ## Install development tools
	go install github.com/cosmtrek/air@latest
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

kill:
	kill $(lsof -t -i:8080) || true