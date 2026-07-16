# AIMleap QueueJob

Lightweight queue + worker example built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Setup

- Prerequisites: Docker & Docker Compose, Node.js 20, npm
- Clone the repo and install (optional for local development):

```bash
git clone <repo>
cd AIMleap-queuejob
npm ci
cp .env.example .env
```

Adjust environment variables in `.env` as needed. The project uses `DATABASE_URL` and `REDIS_HOST` for runtime configuration.

## Running locally

Recommended (Docker Compose):

```bash
docker compose up --build
```

This builds the app and starts `postgres`, `redis`, `migrate`, `api`, and `worker` services. API will be reachable at `http://localhost:3000`.

Manual local run (dev):

```bash
npm run build
node dist/db/migrate.js
npm run dev   # starts the API (non-docker)
npm run dev:worker  # starts the worker (non-docker)
```

Debugging in Docker (attach from VS Code):
- Expose the Node inspector port `9229` in `docker-compose.yml` and start the API with `--inspect-brk=0.0.0.0:9229`.
- Use the `Attach to Docker API` launch configuration in `.vscode/launch.json` to attach and hit breakpoints.

## API Documentation

- Swagger UI is exposed at `/api/docs` when the API is running.
- Open `http://localhost:3000/api/docs` to view endpoints, schemas, and try requests.

Main endpoints:
- `POST /api/v1/jobs` — create a job
- `GET  /api/v1/jobs` — list jobs (query: `status`, `page`, `pageSize`)
- `GET  /api/v1/jobs/:id` — retrieve a job
- `DELETE /api/v1/jobs/:id` — cancel a queued job

## Design decisions

- Runtime: Node.js + TypeScript for fast iteration and type safety.
- Persistence: PostgreSQL holds durable job records and audit information.
- Queueing: Redis used for transient/real-time primitives (fast lists, rate limits, delayed/priority logic).
- Error handling: Centralized `errorHandler` maps `DomainError` subclasses to HTTP responses and logs unexpected errors.
- Debugging: Prefer running inside Docker and attaching VS Code to the Node inspector for parity with production container behavior.
