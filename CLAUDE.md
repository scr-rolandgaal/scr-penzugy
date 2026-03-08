# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server → http://localhost:5173
npm run build     # Production build (output: dist/)
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

## Environment Setup

Copy `.env.example` to `.env` and fill in Supabase credentials:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Without `.env`, the app runs in **offline mode** using localStorage — fully functional for development.

## Architecture

**Tab-based SPA** — no react-router. `App.jsx` handles the auth gate; if authenticated, it renders `MainApp` which owns the active tab state and switches between three views: Dashboard, Tranzakciók, Tervezés.

### Auth flow

`App` (auth gate) → if not logged in → `LoginPage` → on success → `MainApp`

The split into `App` + `MainApp` is intentional: data hooks (`useTransactions`, `useForecasts`) live in `MainApp` to avoid a React Rules of Hooks violation from early returns in `App`.

- `src/hooks/useAuth.js` — session state, `signIn`, `signOut`
- `src/components/LoginPage.jsx` — email/password login form
- Supabase project: TACIT (`zatadaeqyqlokmwvwnah`), region: eu-west-1

### Data flow

```
Supabase (prod) ──┐
                  ├── hooks/ ── components
localStorage (dev)┘
```

`useTransactions` and `useForecasts` are the single source of truth. They check `isSupabaseReady` at runtime:
- `.env` set → Supabase primary, localStorage as offline cache
- No `.env` → localStorage only, seeded from `sampleData.js` on first load

### Key patterns

**DB field mapping:** Supabase uses snake_case columns. Each hook has `fromDb()` / `toDb()` mappers — always go through these when touching DB calls.

**`netAmount` is always computed:** `Math.round(amount / (1 + vatRate / 100))`. Never store it manually.

**Optimistic UI:** `toggleStatus` updates local state immediately, then fires the Supabase update async (fire-and-forget). Other mutations wait for the DB response before updating state.

### Supabase schema

Schema source of truth: `src/lib/schema.sql`. Three tables:
- `transactions` — main financial records
- `forecasts` — revenue pipeline items
- `income_categories` — user-defined income category names (expense categories are hardcoded in `sampleData.js`)

RLS policy: `auth.role() = 'authenticated'` on all three tables. No per-user row isolation — all authenticated users share the same data.

### Utilities

- `src/utils/calculations.js` — all aggregation logic (KPIs, monthly totals, cashflow, category breakdowns). Components never aggregate data directly.
- `src/utils/formatters.js` — currency and date formatting helpers used throughout components.

### Styling

**Tailwind v4** with the `@tailwindcss/vite` plugin (no `tailwind.config.js`). CSS custom properties in `src/index.css`:
- `--primary: #7B5CF6` (purple), `--secondary: #00D4F5` (cyan)
- Reusable classes: `.card`, `.btn-primary`, `.badge-fizetve`, `.badge-kifizetetlen`, `.form-input` — prefer these over inline Tailwind for shared UI patterns.
