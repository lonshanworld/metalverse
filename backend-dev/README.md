# Medalverse Backend

Go Gin backend with PostgreSQL, JWT authentication, and cloud-agnostic S3-compatible storage (MinIO for local development).

## Features

- 🚀 **Go Gin Framework** — Fast and lightweight HTTP framework
- 🐘 **PostgreSQL** — Robust relational database with GORM
- 🔐 **JWT Authentication** — Secure token-based auth
- 📦 **MinIO** — S3-compatible local storage
- 🐳 **Docker Compose** — Easy multi-container setup
- 🔄 **Hot Reload** — Development mode with Air
- 🌐 **Cloud-Agnostic** — Storage interface supports multiple providers
- 🗂️ **Layered Architecture** — Repository → Service → Handler pattern

## Quick Start

### Prerequisites

- Go 1.21+
- Docker & Docker Compose
- Make (optional)

### Setup

1. **Clone and navigate to the project**

```bash
cd medalverse-be
```

2. **Copy environment file**

```bash
cp .env.example .env
```

> **Note**: `.env` is configured for local development (`DB_HOST=localhost`). Docker uses `.env.docker` with Docker network hostnames.

3. **Start services with Docker Compose**

```bash
docker-compose up -d
# or
make docker-up
```

4. **Run the application**

```bash
make run
# or
go run cmd/api/main.go
```

5. **Access the services**
   - API: http://localhost:8080
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
   - PostgreSQL: localhost:5432

### Development (Hot Reload)

```bash
make install-tools   # Install Air
make dev             # Run with hot reload
```

---

## API Endpoints

> 🔒 = Protected route — requires `Authorization: Bearer <token>` header.
> Auth middleware is currently **bypassed** in development; all routes are accessible without a token.

---

### System

| Method | Path      | Description     |
| ------ | --------- | --------------- |
| GET    | `/health` | Health check    |
| GET    | `/readyz` | Readiness check |

```bash
curl http://localhost:8080/health
curl http://localhost:8080/readyz
```

---

### Authentication

| Method | Path                          | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| POST   | `/api/v1/auth/register`       | Register new user                |
| POST   | `/api/v1/auth/verify-email`   | Verify 6-digit email OTP         |
| POST   | `/api/v1/auth/login`          | Login and get JWT token          |
| GET    | `/api/v1/auth/google`         | Redirect to Google OAuth consent |
| GET    | `/api/v1/auth/google/callback`| Google OAuth callback            |

#### Register

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### Verify Email (OTP)

```bash
curl -X POST http://localhost:8080/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Google OAuth

```bash
# Open in browser — redirects to Google consent screen
curl -L http://localhost:8080/api/v1/auth/google
```

---

### Profile 🔒

| Method | Path              | Description              |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/v1/profile` | Get current user profile |

```bash
curl http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Users

| Method | Path                           | Auth   | Description          |
| ------ | ------------------------------ | ------ | -------------------- |
| GET    | `/api/v1/users/email?email=`   | Public | Get user by email    |
| GET    | `/api/v1/users`                | 🔒     | List all users       |
| GET    | `/api/v1/users/:id`            | 🔒     | Get user by ID       |
| PUT    | `/api/v1/users/:id`            | 🔒     | Update user          |
| DELETE | `/api/v1/users/:id`            | 🔒     | Delete user          |

#### Get user by email (public)

```bash
curl "http://localhost:8080/api/v1/users/email?email=user@example.com"
```

#### List all users

```bash
curl http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get user by ID

```bash
curl http://localhost:8080/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update user

```bash
curl -X PUT http://localhost:8080/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "first_name": "Jane",
    "last_name": "Doe",
    "password": "newpassword123",
    "avatar_file_id": "550e8400-e29b-41d4-a716-446655440001",
    "is_active": true
  }'
```

#### Delete user

```bash
curl -X DELETE http://localhost:8080/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Events 🔒

| Method | Path                 | Description                          |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/api/v1/events`     | List events (paginated)              |
| GET    | `/api/v1/events/:id` | Get event by ID                      |
| POST   | `/api/v1/events`     | Create event                         |
| PUT    | `/api/v1/events/:id` | Update event                         |
| DELETE | `/api/v1/events/:id` | Delete event                         |

Query params for list: `page` (default: 1), `page_size` (default: 10, max: 100)

#### List events

```bash
curl "http://localhost:8080/api/v1/events?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get event by ID

```bash
curl http://localhost:8080/api/v1/events/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create event

```bash
curl -X POST http://localhost:8080/api/v1/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Hackathon 2026",
    "short_description": "Annual hackathon event",
    "description": "Join us for a 24-hour coding challenge",
    "start_at": "2026-04-01T08:00:00Z",
    "end_at": "2026-04-02T08:00:00Z",
    "registration_deadline": "2026-03-25T23:59:59Z",
    "capacity": 200,
    "is_sponsored": false,
    "status": "published"
  }'
```

#### Update event

```bash
curl -X PUT http://localhost:8080/api/v1/events/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hackathon 2026 (Updated)",
    "capacity": 300,
    "status": "published",
    "is_sponsored": true
  }'
```

#### Delete event

```bash
curl -X DELETE http://localhost:8080/api/v1/events/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Organizations 🔒

| Method | Path                        | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/organizations`     | List all organizations |
| GET    | `/api/v1/organizations/:id` | Get organization by ID |
| POST   | `/api/v1/organizations`     | Create organization    |
| PUT    | `/api/v1/organizations/:id` | Update organization    |
| DELETE | `/api/v1/organizations/:id` | Delete organization    |

#### List organizations

```bash
curl http://localhost:8080/api/v1/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get organization by ID

```bash
curl http://localhost:8080/api/v1/organizations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create organization

```bash
curl -X POST http://localhost:8080/api/v1/organizations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MedalVerse Foundation",
    "abbreviation": "MVF",
    "description": "Official organizer for MedalVerse events",
    "website": "https://medalverse.io"
  }'
```

#### Update organization

```bash
curl -X PUT http://localhost:8080/api/v1/organizations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MedalVerse Foundation Updated",
    "website": "https://medalverse.io/new",
    "is_active": true
  }'
```

#### Delete organization

```bash
curl -X DELETE http://localhost:8080/api/v1/organizations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Credentials 🔒

| Method | Path                      | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/v1/credentials`     | List credentials (paginated)       |
| GET    | `/api/v1/credentials/:id` | Get credential by ID               |
| POST   | `/api/v1/credentials`     | Create credential                  |
| PUT    | `/api/v1/credentials/:id` | Update credential                  |
| DELETE | `/api/v1/credentials/:id` | Delete credential                  |

Query params for list: `page` (default: 1), `page_size` (default: 10, max: 100)

Credential `type` values: `CERTIFICATE` | `TROPHY` | `MEDAL` | `BADGE`

#### List credentials

```bash
curl "http://localhost:8080/api/v1/credentials?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get credential by ID

```bash
curl http://localhost:8080/api/v1/credentials/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create credential

```bash
curl -X POST http://localhost:8080/api/v1/credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "First Place Trophy",
    "type": "TROPHY",
    "recipient_name": "John Doe",
    "rank": "1st",
    "key_learning": "Teamwork and innovation",
    "is_private": false
  }'
```

#### Update credential

```bash
curl -X PUT http://localhost:8080/api/v1/credentials/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Champion Trophy",
    "type": "MEDAL",
    "rank": "Gold",
    "is_private": true
  }'
```

#### Delete credential

```bash
curl -X DELETE http://localhost:8080/api/v1/credentials/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Medal Verse Codes 🔒

| Method | Path                            | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/v1/medal-verse-codes`     | List all codes           |
| GET    | `/api/v1/medal-verse-codes/:id` | Get code by ID           |
| POST   | `/api/v1/medal-verse-codes`     | Create code              |
| PUT    | `/api/v1/medal-verse-codes/:id` | Update code              |
| DELETE | `/api/v1/medal-verse-codes/:id` | Delete code              |

#### List medal verse codes

```bash
curl http://localhost:8080/api/v1/medal-verse-codes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get medal verse code by ID

```bash
curl http://localhost:8080/api/v1/medal-verse-codes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create medal verse code

```bash
curl -X POST http://localhost:8080/api/v1/medal-verse-codes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "HACK2026",
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "max_uses": 100,
    "expires_at": "2026-04-30T23:59:59Z"
  }'
```

#### Update medal verse code

```bash
curl -X PUT http://localhost:8080/api/v1/medal-verse-codes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "HACK2026-NEW",
    "max_uses": 200,
    "is_active": false
  }'
```

#### Delete medal verse code

```bash
curl -X DELETE http://localhost:8080/api/v1/medal-verse-codes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Files 🔒

| Method | Path                              | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/v1/files/upload`            | Upload file (multipart/form-data) |
| GET    | `/api/v1/files`                   | List current user's files      |
| GET    | `/api/v1/files/:id/presigned-url` | Get temporary presigned URL    |
| DELETE | `/api/v1/files/:id`               | Delete file                    |

#### Upload file

```bash
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.png"
```

#### List files

```bash
curl http://localhost:8080/api/v1/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get presigned URL (valid 60 min)

```bash
curl http://localhost:8080/api/v1/files/550e8400-e29b-41d4-a716-446655440000/presigned-url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Delete file

```bash
curl -X DELETE http://localhost:8080/api/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Project Structure

```
medalverse-be/
├── cmd/
│   └── api/
│       └── main.go                    # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go                  # Configuration management
│   ├── database/
│   │   └── database.go                # Database connection & migrations
│   ├── handlers/                      # HTTP handlers
│   │   ├── auth.go
│   │   ├── user_handler.go
│   │   ├── event_handler.go
│   │   ├── organization_handler.go
│   │   ├── credential_handler.go
│   │   ├── medal_verse_code_handler.go
│   │   ├── file.go
│   │   ├── health.go
│   │   └── readyz.go
│   ├── middleware/
│   │   ├── auth.go                    # JWT middleware
│   │   └── cors.go                    # CORS middleware
│   ├── models/                        # GORM models
│   │   ├── user.go
│   │   ├── event.go
│   │   ├── organization.go
│   │   ├── credential.go
│   │   ├── medal_verse_code.go
│   │   └── file.go
│   ├── repositories/                  # Database access layer
│   │   ├── user_repository.go
│   │   ├── event_repository.go
│   │   ├── organization_repository.go
│   │   ├── credential_repository.go
│   │   └── medal_verse_code_repository.go
│   ├── routes/                        # Route registration (1 file per entity)
│   │   ├── routes.go
│   │   ├── user_routes.go
│   │   ├── event_routes.go
│   │   ├── organization_routes.go
│   │   ├── credential_routes.go
│   │   └── medal_verse_code_routes.go
│   ├── services/                      # Business logic layer
│   │   ├── user_service.go
│   │   ├── event_service.go
│   │   ├── organization_service.go
│   │   ├── credential_service.go
│   │   └── medal_verse_code_service.go
│   ├── storage/
│   │   ├── storage.go                 # Storage interface
│   │   ├── minio.go                   # MinIO implementation
│   │   └── factory.go                 # Storage factory
│   └── utils/
│       ├── jwt.go                     # JWT utilities
│       └── password.go                # Password hashing
├── .air.toml                          # Air hot-reload config
├── .env.example                       # Environment template
├── docker-compose.yml                 # Docker services
├── Dockerfile                         # Application container
├── Makefile                           # Development commands
└── go.mod                             # Go dependencies
```

---

## Environment Variables

```env
# Server Configuration
SERVER_PORT=8080
GIN_MODE=debug

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USER=medalverse
DB_PASSWORD=medalverse_password
DB_NAME=medalverse_db
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=secret
JWT_EXPIRY_HOURS=24

# MinIO Configuration
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=medalverse


STORAGE_PROVIDER=minio
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Environment
ENV=development
```

---

## Make Commands

```bash
make help           # Show all commands
make build          # Build the application
make run            # Run the application
make dev            # Run with hot reload (Air)
make test           # Run tests
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make docker-logs    # View logs
make install-tools  # Install Air and other tools
```

---

## Cloud Storage Providers

Switch providers via `STORAGE_PROVIDER` env var:

| Value   | Provider               |
| ------- | ---------------------- |
| `minio` | MinIO (local, default) |
| `aws`   | Amazon S3              |
| `gcp`   | Google Cloud Storage   |
| `azure` | Azure Blob Storage     |

---

## Database

Uses GORM with auto-migration. Migrations run automatically on startup in `development` mode.

**Models:** `users`, `events`, `organizations`, `credentials`, `medal_verse_codes`, `files`

---

## Troubleshooting

### Port already in use

```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database connection issues

```bash
docker-compose ps
docker-compose logs postgres
```

### MinIO issues

```bash
# Console: http://localhost:9001 (minioadmin/minioadmin)
docker-compose logs minio
```

---

## License

MIT License
