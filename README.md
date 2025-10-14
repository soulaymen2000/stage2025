# Stage 2025 – Monorepo

This repository contains the Angular frontend, the Spring Boot backend (`backend2`), and a small ML microservice used for recommendations.

## Structure

- `backend2/` – Spring Boot API (PostgreSQL + JPA + JWT)
- `frontend/client-app/` – Angular 20 application (dev proxy to backend)
- `model/ml_api/` – Python service (expected on port 8001)

## Quick start (local)

- Backend: `mvn -f backend2 spring-boot:run` (listens on 1234)
- Frontend: `cd frontend/client-app && npm install && npm start` (listens on 4200; proxies `/api` to `1234`)
- ML API: `python model/ml_api/main.py` (listens on 8001)

Ensure PostgreSQL is running with a database matching your `backend2/src/main/resources/application.properties` or environment variables.

## Configuration

Backend (`backend2`):
- `spring.datasource.url` – PostgreSQL JDBC URL
- `spring.datasource.username` / `spring.datasource.password`
- `ml.api.base-url` – e.g. `http://localhost:8001`
- JWT secret should be provided via environment variable in production

Frontend (`frontend/client-app`):
- Dev proxy in `proxy.conf.json` maps `/api` to `http://localhost:1234`

## Authentication and Roles

- JWT-based auth: `POST /api/auth/login` returns `{ token: string }`
- Roles: `CLIENT`, `FOURNISSEUR`, `ADMIN`
- Public endpoints: `GET /api/services/**`, `GET /api/services/recommendations` (others as configured)
- Mutations on services require `FOURNISSEUR`

## Code quality conventions

- Constructor injection via Lombok `@RequiredArgsConstructor`
- SLF4J logging via `@Slf4j`, no `System.out` in production code
- Centralized CORS with `CorsConfig`; no controller-level CORS annotations
- Controllers return specific status codes using `ResponseStatusException` where relevant
