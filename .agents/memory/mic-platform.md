---
name: MIC Platform Architecture
description: Key facts about the Marketing Initiative Community platform build
---

# MIC Platform Architecture

## Stack
- Frontend: React 18 + Vite + TypeScript at `client/`, port 5000
- Backend: Express + TypeScript at `server/`, port 3001
- Database: PostgreSQL via `DATABASE_URL` (Replit built-in)
- Auth: JWT tokens stored in localStorage, Zustand store

## Key Design Decisions
- All UI is in Arabic, RTL direction (Tajawal font)
- Brand: Deep navy #1e3a5f (primary), pink #e8a5b8 (secondary/accent)
- Vite proxies `/api/*` → `http://localhost:3001`
- Database is seeded automatically on server startup via `seedDatabase()` in `server/src/db/index.ts`
- Default admin: admin@micommunity.com / Admin@1234

**Why Arabic-only UI:** The platform targets Arab-world marketing professionals.
**Why JWT in localStorage:** Simple client-side auth without server sessions; token sent as Bearer header.
