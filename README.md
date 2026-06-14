# SplitMates — Shared Expense Manager

SplitMates is a backend-first shared-expenses platform for groups (friends, roommates, teams) that tracks spending, computes balances deterministically, and generates minimal settlement plans so groups settle debts with the fewest transfers.

Quick highlights:

- Deterministic balance calculations with small-epsilon handling
- Heap-based settlement planner with O(n log n) performance
- Backend-first Node.js + TypeScript API with a lightweight EJS demo UI

**Project name:** splitmates

**Repository status:** production-ready server + demo UI, Jest unit tests

**Tech overview**

- Runtime: Node.js 20+
- Language: TypeScript
- Web: Express
- DB: PostgreSQL
- Cache: Redis
- Views: EJS (demo)
- Auth: JWT + bcrypt
- Validation: express-validator
- Logging: Pino, Morgan

**Key features**

- JWT auth with refresh tokens and revocation
- User profiles with password change and soft-delete
- Group management, role-based access, and invite links
- Expense creation (equal, percentage, custom splits)
- CSV/TSV bulk import for expenses
- Settlement planning + idempotent execution
- PDF export for settlement reports
- In-app notifications with optional SMTP delivery
- Redis caching for balances and settlement plans

**Architecture (high level)**

- `src/` — app bootstrap and server startup
- `db/` — schema, migrations, seeds, DB + Redis helpers
- `modules/` — domain modules (auth, users, groups, expenses, settlements, notifications)
- `frontend/` — demo UI and browser API calls
- `public/`, `views/` — demo assets and EJS pages

Request flow:

UI or API client -> Express route -> validation -> controller -> service -> PostgreSQL / Redis -> response

## Quickstart

Prerequisites:

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

Install and run locally:

```bash
npm install
cp .env.sample .env
# edit .env (DB_URL, REDIS_URL, JWT secrets, SMTP if used)
npm run db:setup
npm run db:seed
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

Run tests:

```bash
npm test
```

## Environment variables

Copy `.env.sample` to `.env` and set values for:

- `DB_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `SMTP_*` — optional, for email notifications

## API summary

The app exposes a REST API. Common endpoints:

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- Users: `GET /api/users/me`, `PUT /api/users/me`, `POST /api/users/me/change-password`, `DELETE /api/users/me`
- Groups: CRUD + `GET /api/groups/:groupId/balances`, invite routes
- Expenses: `POST /api/expenses`, `GET /api/expenses`, `GET /api/expenses/:expenseId`, `PUT`, `DELETE`
- Settlements: `GET /api/settlements/plan/:groupId`, `POST /api/settlements/execute`, history & export
- Notifications: read/unread endpoints

See `docs/openapi.yaml` for a full API spec.

## Testing

- Jest unit tests for core services and middleware
- Tests run without touching the production database (mocked)

```bash
npm test
```

## Contributing

- Follow conventional commits for PRs
- Run unit tests and linters before submitting
- Add unit tests for any new business logic

## Useful files

- [docs/project-detail.md](docs/project-detail.md)
- [docs/openapi.yaml](docs/openapi.yaml)
- [postman/SplitMate.postman_collection.json](postman/SplitMate.postman_collection.json)

## License

This project uses the license in the repository root. Update `LICENSE` as needed.

---

If you'd like, I can:

- add badges (build, coverage)
- create a short `CONTRIBUTING.md`
- generate a one-page API usage example for the frontend demo

Tell me which of the above you'd like next.
