---
name: MIC Advanced Features
description: Documents the advanced feature set built for the MIC platform — roles, banning, messaging, onboarding, and admin moderation.
---

## 9-Role System (User model)
Roles: `super_admin`, `admin`, `moderator`, `senior_moderator`, `editor`, `reviewer`, `support`, `member`, `guest`
Statuses: `active`, `inactive`, `pending`, `suspended`, `banned`, `muted`, `archived`

**Why:** Old system only had 3 roles (member/moderator/admin). New system supports fine-grained permissions.

## Ban System
- Route: `POST /api/ban/ban/:userId` — supports `permanent`, `temporary`, `shadow`, `soft` ban types
- Route: `POST /api/ban/unban/:userId`, `/mute/:userId`, `/unmute/:userId`
- Appeals: `POST /api/ban/appeal/:userId` (user), `PUT /api/ban/appeal/:userId` (admin)
- Ban history stored in `user.banInfo.history[]`
- Shadow ban: user stays logged in but appears banned to others; skip status change

## Private Messaging
- Conversations: `GET/POST /api/messages/conversations`
- Messages: `GET/POST /api/messages/conversations/:convId/messages`
- Archive/Delete: `PUT/DELETE /api/messages/conversations/:convId/archive|delete`
- User search: `GET /api/messages/users/search?q=`
- Client page: `MessagesPage.tsx` at route `/messages`

## Onboarding Flow
- 5-step bottom-sheet modal: Welcome → About → How it works → Interests → Done
- Shows when `user.onboarding.completed === false` after login (checked via `OnboardingGate` in `App.tsx`)
- API: `PUT /api/auth/me/onboarding` with `{ step, completed, interests, country, language }`

## Admin & Moderation
- Dashboard: `/admin` — uses `GET /api/admin/dashboard` (stats + growth chart + audit feed)
- Members: `/admin/members` — uses `GET /api/admin/members` (paginated, search, filter by role/status)
- Moderation: `/admin/moderation` — reports/banned/muted/appeals tabs; uses `GET /api/admin/moderation`
- AuditLog: `/admin/audit` — uses `GET /api/audit` (paginated, filterable by action)
- Admin roles allowed in sidebar: all 7 admin roles (not just admin/moderator)

## Toast Usage
**Critical:** The toast hook exports `toast(message: string, type: 'success'|'error'|'info')` as a plain function, NOT a hook returning `{ toast }`. Using `useToast()` or `toast({ title })` format will break.

## Security Middleware
- `server/src/middleware/security.ts` — rate limiters (general 300/15min, auth 10/15min, upload 20/hr) + XSS sanitizer
- Helmet added to server/src/index.ts
- Morgan logging
- Ban check on login: temporary bans auto-expire, shadow bans pass through

## New Routes in server/src/index.ts
- `/api/ban` — ban system
- `/api/messages` — private messaging
- `/api/reports` — report system
- `/api/audit` — audit log (admin only)
- `/api/admin` — enhanced admin endpoints (replaces old `/api/members/admin/*`)
