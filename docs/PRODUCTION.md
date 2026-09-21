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