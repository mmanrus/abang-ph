# Abang PH Production Operations

This document contains the basic safety rules for operating
Abang PH in production.

## Environments

### Development

Application:
- Local Next.js

Database:
- Docker PostgreSQL
- `abang_dev`
- localhost:5433

Development data may be reset or seeded.

### Production

Application:
- Vercel

Database:
- Neon PostgreSQL
- Production branch

Production contains real landlord and financial records.

---

## Database Safety

Never run the following against production:

```bash
prisma migrate reset
prisma migrate dev
prisma db push
prisma db push --force-reset
prisma db seed


## Production Security Audit

Last reviewed: 2026-09-21

### Verified

- Production secrets are not tracked by Git.
- `.env` is ignored and remains configured for local Docker development.
- Sentry build credentials are ignored and untracked.
- Production Prisma migrations are up to date.
- Destructive Prisma commands are prohibited in production.
- HTTPS and HSTS are enabled.
- Security headers are present.
- Service worker script is not cached.
- Better Auth rate limiting is database-backed.
- Login rate limiting returns HTTP 429 after the configured threshold.
- Production health endpoint returns a safe HTTP 200 response when healthy.
- Structured logging does not intentionally log passwords, tokens, cookies, or customer objects.
- Sentry user information and HTTP request bodies are disabled.
- Sentry errors are sanitized before transmission.
- Cross-landlord direct-ID access is blocked.
- Financial corrections preserve payment history through void/reversal behavior.
- Authenticated application data is not stored in the PWA cache.
- Typecheck, lint, migration checks, and production build pass.

### Production Safety Rules

Never run the following against production:

- `prisma migrate reset`
- `prisma migrate dev`
- `prisma db push --force-reset`
- `prisma db seed`

Production schema changes use committed migrations and:

`prisma migrate deploy`

Financial history must not be repaired through destructive deletion.

If a production incident occurs, follow `docs/RECOVERY.md`.