# EISA Nexus Backend — Spring Boot + MongoDB + JWT

Backend pour la base des recommandations électorales EISA.

## Stack
- Java 17, Spring Boot 3.3
- Spring Web, Spring Security, Spring Data MongoDB, Validation
- JWT (jjwt 0.12)
- Lombok

## Lancement

1. Démarrer MongoDB local (`mongodb://localhost:27017/eisa_nexus`) ou définir `MONGODB_URI`.
2. `mvn spring-boot:run`
3. L’API est servie sur `http://localhost:8080/api`.

Au démarrage, un admin est créé : `admin@eisa.org` / `admin1234` (à changer !).

## Variables d’environnement

| Variable | Défaut | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/eisa_nexus` | URI MongoDB |
| `JWT_SECRET` | (clé démo) | Secret base64 (≥ 256 bits) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Origines autorisées |

## Modèle de données

- **User** (`users`) — name, email, password (BCrypt), country, roles `[ADMIN|EDITOR|VIEWER]`
- **Institution** (`institutions`) — name, country, category
- **Mission** (`missions`) — liée à une **Institution** (`institutionId`)
- **Recommendation** (`recommendations`) — liée à une **Mission** (`missionId`) et une **Institution** (`institutionId`)
- **FollowUp** (`follow_ups`) — lié à une **Recommendation** (`recommendationId`)

## Endpoints

### Auth (public)
- `POST /auth/register` — `{ name, email, password, country, countryCode }`
- `POST /auth/login` — `{ email, password }` → `{ token, email, name, roles }`

Utiliser le token : `Authorization: Bearer <token>`.

### Users (ADMIN seul)
- `GET /users`, `GET /users/{id}`
- `POST /users/invite` — `{ name, email, country, countryCode, roles, tempPassword }`
- `PATCH /users/{id}/roles` — `{ roles: ["ADMIN"] }`
- `PATCH /users/{id}` — name / country
- `DELETE /users/{id}`

### Institutions
- `GET /institutions`, `GET /institutions/{id}` — auth
- `POST` / `PUT` — ADMIN/EDITOR
- `DELETE` — ADMIN

### Missions
- `GET /missions[?institutionId=...]`, `GET /missions/{id}` — auth
- `POST` / `PUT` — ADMIN/EDITOR
- `DELETE` — ADMIN

### Recommendations
- `GET /recommendations[?missionId=...]`, `GET /recommendations/{id}` — auth
- `POST` / `PUT` — ADMIN/EDITOR
- `PATCH /recommendations/{id}/visibility` — `{ visibility: "PUBLIC"|"INTERNAL"|"DRAFT" }`
- `DELETE` — ADMIN

### Follow-ups
- `GET /follow-ups[?recommendationId=...]`, `GET /follow-ups/{id}` — auth
- `POST` (met à jour le `status` + `lastUpdate` de la recommandation) / `PUT` — ADMIN/EDITOR
- `DELETE` — ADMIN

### Public (sans auth — pour le portail public)
- `GET /public/recommendations` — uniquement celles avec `visibility = PUBLIC`

## Rôles
- `ADMIN` — accès complet, gestion utilisateurs
- `EDITOR` — CRUD sur recommendations, missions, institutions, follow-ups
- `VIEWER` — lecture seule
