# Abang PH Production Recovery Procedure

This document describes how to respond to production incidents safely.

The priority order is:

1. Protect customer data.
2. Stop further damage.
3. Preserve evidence and logs.
4. Recover service.
5. Verify data integrity.
6. Document what happened.

---

## 1. Production incident examples

Treat these as production incidents:

- Abang is unavailable.
- Neon production database is unavailable.
- A deployment breaks login or core landlord workflows.
- A Prisma migration fails.
- Financial records appear incorrect.
- Data was deleted or modified unexpectedly.
- A secret or credential may have been exposed.
- Sentry reports a high-impact production error.

---

## 2. First response

Do NOT immediately reset, seed, or modify the production database.

Never run:

```bash
prisma migrate reset
prisma db push --force-reset
prisma migrate dev
prisma db seed