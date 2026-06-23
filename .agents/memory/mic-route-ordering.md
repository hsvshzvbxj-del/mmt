---
name: MIC Route Ordering Fix
description: Express route ordering issue in members router
---

# Express Route Ordering: members.ts

## Rule
In `server/src/routes/members.ts`, the admin sub-routes `/admin/all` and `/admin/:id` MUST be registered BEFORE the wildcard `/:id` route. Otherwise Express matches `/admin/all` as `/:id` with id='admin'.

**Why:** Express matches routes in registration order. The `/admin/all` literal path must precede `/:id` wildcard.

**How to apply:** Any time you add a named sub-path alongside a `/:param` wildcard in the same router, put named paths first.

## Correct order in members.ts:
1. `GET /` — list active members (with filters)
2. `GET /stats` — public stats
3. `GET /admin/all` — admin: all members (must be BEFORE /:id)
4. `PUT /admin/:id` — admin: update member
5. `DELETE /admin/:id` — admin: delete member
6. `GET /:id` — public member profile (must be LAST)
