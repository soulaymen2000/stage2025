# Backend2 – Spring Boot API

## Overview

- Framework: Spring Boot 3.5
- Persistence: JPA (PostgreSQL)
- Security: Spring Security + JWT
- ML integration: calls Python service at `ml.api.base-url`

## Modules

- `config/` – security and CORS configuration
- `controller/` – REST controllers (`/api/**`)
- `dto/` – response payloads (stats, reservation detail)
- `exception/` – global exception handler
- `model/` – JPA entities
- `repository/` – Spring Data JPA repositories
- `security/` – JWT utilities and filter
- `service/` – application services (user, review, recommendation)

## Key endpoints

- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Services:
  - `GET /api/services` – list (public; filters supported)
  - `GET /api/services/{id}` – details (public)
  - `POST /api/services` – create (role `FOURNISSEUR`)
  - `PUT /api/services/{id}` – update (role `FOURNISSEUR`)
  - `DELETE /api/services/{id}` – delete (role `FOURNISSEUR`)
  - `GET /api/services/{id}/similar` – similar services
  - `GET /api/services/recommendations` – personalized recommendations
- Reservations: `/api/reservations/**`
- Reviews: `/api/reviews/**`

## Configuration

Example (`src/main/resources/application.properties`):

```
spring.datasource.url=jdbc:postgresql://localhost:5432/stage-db
spring.datasource.username=postgres
spring.datasource.password=omrani
server.port=1234
ml.api.base-url=http://localhost:8001
```

Recommended: provide secrets via environment variables in production.

## Conventions

- Constructor injection with Lombok `@RequiredArgsConstructor`
- SLF4J logging via `@Slf4j`
- Centralized CORS in `CorsConfig`
- No controller-level `@CrossOrigin`
- Clear HTTP statuses using `ResponseStatusException`

## Run

```
mvn spring-boot:run
```

Ensure PostgreSQL is running and reachable.
