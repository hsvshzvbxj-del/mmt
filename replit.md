# Marketing Initiative Community Platform

## Overview

A full-stack community platform for marketing professionals in the Arab world. Arabic name: **مجتمع مبادرة تسويقية**.

## Architecture

- **Frontend:** React 18 + Vite + TypeScript, running on port 5000 (Tailwind CSS, shadcn/ui, wouter routing, TanStack Query, Zustand)
- **Backend:** Node.js + Express + TypeScript, running on port 3001 (`server/`)
- **Database:** PostgreSQL (Replit built-in, via `DATABASE_URL`)
- **PWA:** manifest.json + service worker in `client/public/`

## Running the project

Two workflows are configured:
- **Start application** — Runs `cd client && npm run dev` on port 5000 (frontend, visible in preview)
- **Backend API** — Runs `cd server && npm run dev` on port 3001 (API server)

## Default credentials

- Admin: `admin@micommunity.com` / `Admin@1234`
- Sample members: `sara@example.com`, `ahmad@example.com`, `lina@example.com` / `Member@1234`

## Brand

- Primary color: Deep navy blue (#1e3a5f)
- Accent: Soft pink/rose (matching logo)
- Logo: `client/public/logo.png` (Arabic logo: مجتمع مبادرة تسويقية)

## User Roles

1. **Visitor** — Homepage, About, Events (view only), Join form
2. **Member** — All pages, discussions, event registration, profile edit
3. **Moderator** — Admin panel: applications, events, opportunities, articles, members
4. **Admin** — Full access including member role/status management

## User Preferences

- Use the brand color palette (navy + pink) consistently throughout
- Arabic-world professional community aesthetic
- PWA-ready: always maintain manifest.json and service worker
