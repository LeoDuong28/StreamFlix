.PHONY: up down build logs backend-build frontend-build test clean

# Docker Compose
up:
	cd docker && docker compose up -d

down:
	cd docker && docker compose down

build:
	cd docker && docker compose build

logs:
	cd docker && docker compose logs -f

logs-backend:
	cd docker && docker compose logs -f backend

# Backend
backend-build:
	cd backend && ./mvnw clean package -DskipTests

backend-test:
	cd backend && ./mvnw test

backend-run:
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
frontend-install:
	cd frontend && npm install

frontend-build:
	cd frontend && npm run build

frontend-run:
	cd frontend && npm start

# Clean
clean:
	cd docker && docker compose down -v
	cd backend && ./mvnw clean
	rm -rf frontend/dist frontend/node_modules/.cache
