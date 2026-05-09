# FairReward AI — Build Checkpoint

> Snapshot as of 2026-05-10.
> Refer to `blueprint.md` for the full design; this file tracks **what's done** and **what's next** so anyone (you, your teammate, a future agent) can pick up cleanly.

---

## ✅ What's done

### Phase 0 — Setup

- [x] **Project scaffold** — Next.js 15 (App Router), TypeScript strict, Tailwind 3, ESLint + Prettier, `.gitignore`, `vercel.json` (Mumbai region + cron config), `tsconfig.json` with `@/*` path alias.
- [x] **Dependencies declared** in `package.json` (Supabase SSR, Upstash Redis + ratelimit, Zod, TanStack Query, Recharts, Zustand, Resend, lucide). Run `pnpm install` once.
- [x] **Env templates** — `.env.example` and a populated-but-blank `.env.local` (gitignored). Fill values when you provision services.
- [x] **Env validation** — `src/lib/env.ts` parses + types `process.env` (currently lenient so the app builds without secrets; tighten later).

### Phase 1 — Auth & Schema

- [x] **Supabase migrations** in `supabase/migrations/`:
  - `0001_init.sql` — all 13 tables (users, attendance, kpis, kpi_assignments, feedback, badges, user_badges, allocation_cycles, rewards_ledger, catalog_items, redemptions, audit_log, audit_findings) + indexes + `handle_new_user` trigger that auto-creates a `public.users` row on auth signup.
  - `0002_rls.sql` — RLS enabled on every table; `is_admin()` helper; per-table policies matching blueprint §9.
  - `0003_views.sql` — `points_balance` materialised view (+ unique idx + `refresh_points_balance` RPC) and `leaderboard` view.
  - `0004_seed_meta.sql` — seed badges + catalog items.
- [x] **Supabase client trio** — `lib/supabase/{server,browser,admin,middleware}.ts`. Server uses `@supabase/ssr` cookies; admin uses the service role and is server-only.
- [x] **Auth flow**:
  - `/login` and `/signup` pages with client forms calling `supabase.auth.signInWithPassword` / `signUp`.
  - `/auth/callback` route exchanges OAuth/magic-link codes and redirects by role.
  - `/auth/sign-out` POST route clears the session.
- [x] **Middleware** (`src/middleware.ts`) — refreshes Supabase session on every request, redirects unauthenticated users to `/login`, role-gates `/admin/*` against `users.role`.
- [x] **Server guards** — `requireUser()` and `requireAdmin()` in `lib/auth.ts` for use in server components.

### Phase 2/3 skeletons (employee + admin panels)

- [x] **Shared nav** — `Sidebar`, `TopBar`. Sign-out form posts to `/auth/sign-out`.
- [x] **Employee panel** under `/employee/*`:
  - Dashboard (points wallet cards + recent ledger feed).
  - Attendance (list + check-in button calling `/api/attendance/check-in`).
  - KPIs (lists `kpi_assignments` joined with `kpis`).
  - Feedback inbox (sentiment-tagged).
  - Leaderboard (reads `leaderboard` view).
  - Redemption store (reads `catalog_items`).
- [x] **Admin panel** under `/admin/*`:
  - Overview (counts).
  - Users / KPIs / Catalog tables.
  - Allocator index + per-cycle page.
  - Bias audit page (renders `audit_findings`).
  - Redemptions queue with approve/reject buttons (UI-only for now).
  - Settings placeholder.

### API surface (server actions still TODO; route handlers in place)

| Method | Path | Status |
| --- | --- | --- |
| `GET`  | `/api/me` | ✅ returns profile + balance |
| `POST` | `/api/attendance/check-in` | ✅ rate-limited, idempotent per day |
| `POST` | `/api/feedback` | ✅ Zod-validated, rate-limited |
| `GET`  | `/api/leaderboard` | ✅ Redis-cached (60s) |
| `POST` | `/api/redemptions` | ✅ checks balance + stock |
| `POST` | `/api/admin/rewards` | ✅ manual award → ledger |
| `POST` | `/api/admin/allocator/generate` | ✅ calls LLM, returns proposal |
| `POST` | `/api/admin/allocator/publish` | ✅ Redis idempotency, ledger insert via service role, audit log, MV refresh, cache invalidation |
| `GET`  | `/api/admin/audit/fairness` | ✅ DIR + ANOVA + manager skew |
| `POST` | `/api/admin/users/import` | ✅ bulk-creates auth users + profiles |
| `GET`  | `/api/admin/export/csv` | ✅ ledger / users / redemptions |
| `GET`  | `/api/cron/weekly-digest` | 🟡 stub |
| `GET`  | `/api/cron/audit-refresh` | ✅ invalidates audit cache |

### LLM layer

- [x] OpenRouter client with retry/backoff (`lib/llm/client.ts`).
- [x] Zod schemas for sentiment, allocator I/O, bias narrator (`lib/llm/schemas.ts`).
- [x] System prompts (`lib/llm/prompts.ts`) including allocator anti-bias rules.
- [x] Allocator helper (`lib/llm/allocator.ts`) — `proposeAllocation()`, server-side `clamp()` (25% cap, scrubs forbidden tokens, scales-down totals), and `equalSplit()` deterministic fallback.
- [x] Sentiment helper (`lib/llm/sentiment.ts`).
- [x] Edge-function stub `supabase/functions/on-feedback-insert` for the L1 sentiment trigger.

### Audit layer

- [x] `lib/audit/disparate-impact.ts` — `disparateImpactRatio`, `pairwiseDIR`, one-way ANOVA F-stat with rough p-flag, `managerSkew`. All deterministic.
- [x] `lib/audit/anomalies.ts` — `attendanceJumpFlags`, `feedbackSkewFlags`.

### Cache / rate limit / realtime

- [x] `lib/redis.ts` — Upstash client + Ratelimit factories (login, kudos, allocator, feedback, check-in) + cache helpers + key conventions (`leaderboard`, `wallet`, `audit:summary`, `idemp:allocator:*`). Gracefully no-ops in dev when Redis isn't configured.
- [x] `hooks/useRealtimeWallet.ts` — Supabase Realtime channel for `rewards_ledger` per user.

### Seed / scripts

- [x] `scripts/seed.ts` — creates 1 admin + 5 demo employees via the service role.

---

## 🟡 In progress / partial

- **Allocator features wiring** — `/api/admin/allocator/generate` currently feeds **placeholder values** (attendance 80, kpi 70, sentiment 0.2) into the LLM. Replace `monthsSince` callsite in `src/app/api/admin/allocator/generate/route.ts` with real aggregates from `attendance`, `kpi_assignments`, and `feedback`.
- **Audit dashboard narrator** — `/admin/audit` renders the findings table but the LLM-generated headline + paragraphs from `BIAS_NARRATOR_SYSTEM` are not yet rendered. Wire `proposeBiasNarration()` (TBD) into the page using `cacheKeys.auditSummary()`.
- **Admin allocator UI** — list page + cycle page exist but the **Generate**, **Publish**, and rationale-drawer interactions are non-functional. The API endpoints are already in place; only the client wiring is missing.
- **Admin redemption approve/reject** — buttons render but don't POST anywhere yet. Add `/api/admin/redemptions/[id]/decide` and a confirm flow.
- **Database types** — `src/types/database.ts` is hand-rolled. Replace with `pnpm db:types` output once your Supabase project is created.

---

## ⛔ Not started (Phases 4–6)

- **Phase 4 — AI layer end-to-end**: deploying the edge function, hooking sentiment into feedback display, wiring the narrator into the audit page, weekly anomaly cron.
- **Phase 5 — Polish**: shadcn/ui adoption, dark mode toggle, toasts (sonner), confetti on badge unlock, skeletons, empty states, Sentry, Vercel Analytics, consent screen.
- **Phase 6 — Testing & deployment**:
  - Vitest unit + component tests.
  - Playwright E2E (signup → check-in → kudos → award → redeem).
  - pgTAP tests for RLS.
  - Lighthouse pass.
  - Production deploy on `main`.

---

## How to pick up

### Your teammate (styling / UI polish)

- All pages render server-side with bare Tailwind utilities — easy to restyle without touching data logic. Stable surfaces:
  - `src/components/nav/{Sidebar,TopBar}.tsx`
  - `src/app/employee/**/page.tsx`
  - `src/app/admin/**/page.tsx`
  - `src/app/(auth)/{login,signup}/form.tsx`
- Add shadcn/ui via `pnpm dlx shadcn@latest init` whenever ready; the layout already expects a `components/ui/` folder.
- Tokens live in `src/app/globals.css` (CSS variables) and `tailwind.config.ts`.

### You (employee panel feature work)

- The contracts you'll be filling in:
  - `/api/attendance/check-in` — already idempotent, you can layer streak logic.
  - `/api/feedback` — extend with peer-kudos amount.
  - `/api/redemptions` — already balance-checked; add an admin decision route.
  - Realtime wallet: `useRealtimeWallet(userId)` is ready; wire it into `src/app/employee/page.tsx` once you want live updates.
- Don't touch RLS in `0002_rls.sql` without re-checking the cross-account read tests outlined in blueprint §16.

### Anyone

- Provision Supabase, Upstash, OpenRouter, Vercel, Resend; paste keys into `.env.local`.
- `pnpm install` then `supabase db push` to apply migrations, then `pnpm seed`.
- `pnpm dev` → http://localhost:3000.

---

## Files of note

```
src/
├── app/
│   ├── (auth)/{login,signup}/   # client forms
│   ├── auth/{callback,sign-out}/route.ts
│   ├── employee/                # 6 pages
│   ├── admin/                   # 8 pages incl. allocator/[cycleId]
│   └── api/                     # 13 route handlers + 2 cron
├── lib/
│   ├── supabase/{server,browser,admin,middleware}.ts
│   ├── redis.ts                 # cache + ratelimit
│   ├── llm/{client,schemas,prompts,allocator,sentiment}.ts
│   ├── audit/{disparate-impact,anomalies}.ts
│   ├── auth.ts rbac.ts env.ts http.ts utils.ts
├── components/nav/{Sidebar,TopBar}.tsx
├── hooks/{useUser,useRealtimeWallet}.ts
├── stores/ui.ts
├── types/{database,domain}.ts
└── middleware.ts                # session refresh + role gate

supabase/
├── migrations/0001-0004*.sql
├── functions/on-feedback-insert/index.ts
└── config.toml

scripts/seed.ts
```

---

## Risks / things to remember

- **Service-role client** (`lib/supabase/admin.ts`) bypasses RLS — only import from server-only files. The code is structured so it can't leak to the client bundle, but be careful when adding new modules.
- **Allocator placeholders**: until real feature aggregates land, every employee will get a similar bonus suggestion. Don't ship to a pilot tenant without finishing this step.
- **Hand-rolled `types/database.ts`** — drift will silently break queries. Regenerate after every migration: `pnpm db:types`.
- **Rate limiters silently no-op** when Redis isn't configured. Fine for dev; add a startup-time check before staging.
- **`equalSplit` fallback** ensures the allocator still works without an OpenRouter key — it kicks in on any LLM/JSON failure.
