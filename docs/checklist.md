# FairReward AI — Audit Checklist

> Audit date: 2026-05-10
> Compares `docs/blueprint.md` against the current codebase.
> Scope assumes Vercel-only deploy (no Sentry, no GitHub Actions CI, no Playwright).

---

## Legend

- ✅ Implemented as specified
- 🟡 Partially implemented / stubbed / needs polish
- ⛔ Missing
- ➕ Beyond blueprint (already in code)

---

## 1. Implemented perfectly

### Project setup
- ✅ Next.js 15 App Router + TypeScript strict + Tailwind 3
- ✅ `tsconfig.json` with `@/*` alias
- ✅ `vercel.json` (Mumbai region + cron config)
- ✅ `.env.example` template covers Supabase, Upstash, OpenRouter (3 model variants), Resend, app URLs
- ✅ `src/lib/env.ts` Zod-validated env
- ✅ All blueprint dependencies declared in `package.json`

### Database (Supabase)
- ✅ Migration `0001_init.sql` — 13 tables + indexes + `handle_new_user` trigger
- ✅ Migration `0002_rls.sql` — RLS + `is_admin()` + per-table policies
- ✅ Migration `0003_views.sql` — `points_balance` MV + `leaderboard` view + refresh RPC
- ✅ Migration `0004_seed_meta.sql` — badges + catalog seed
- ✅ Migration `0005_oauth_metadata.sql` — Google OAuth mapping
- ✅ Migration `0006_consent.sql` — DPDP consent fields (➕ beyond blueprint)
- ✅ `supabase/functions/on-feedback-insert/index.ts` — sentiment edge function (code complete)
- ✅ `scripts/seed.ts` — 1 admin + 5 demo employees

### Auth & guards
- ✅ Supabase client trio: [server.ts](src/lib/supabase/server.ts), [browser.ts](src/lib/supabase/browser.ts), [admin.ts](src/lib/supabase/admin.ts), [middleware.ts](src/lib/supabase/middleware.ts)
- ✅ `/login`, `/signup`, `/auth/callback`, `/auth/sign-out`
- ✅ Role-based middleware redirect
- ✅ `requireUser()` / `requireAdmin()` server guards

### Employee surface
- ✅ [Dashboard](src/app/employee/page.tsx) — balance cards + recent ledger
- ✅ [Attendance](src/app/employee/attendance/page.tsx) — check-in button + history
- ✅ [KPIs](src/app/employee/kpis/page.tsx) — assignments with progress
- ✅ [Feedback inbox](src/app/employee/feedback/page.tsx) — sentiment chips
- ✅ [Leaderboard](src/app/employee/leaderboard/page.tsx) — top 50
- ✅ [Store](src/app/employee/store/page.tsx) — catalog grid
- ✅ [Consent](src/app/employee/consent/page.tsx) — DPDP opt-in (➕ beyond blueprint)
- ✅ Realtime wallet hook ([useRealtimeWallet.ts](src/hooks/useRealtimeWallet.ts))

### Admin surface
- ✅ [Overview](src/app/admin/page.tsx) — stat cards
- ✅ [Users](src/app/admin/users/page.tsx) — directory table
- ✅ [KPIs](src/app/admin/kpis/page.tsx) — KPI table
- ✅ [Allocator index](src/app/admin/allocator/page.tsx) + [cycle workflow](src/app/admin/allocator/[cycleId]/workflow.tsx) — Generate → edit → Publish
- ✅ [Bias audit](src/app/admin/audit/page.tsx) — DIR + ANOVA + manager skew + LLM narration + findings history
- ✅ [Redemptions](src/app/admin/redemptions/page.tsx) — approve/reject queue
- ✅ [Catalog](src/app/admin/catalog/page.tsx) — items table

### API routes (all wired with Zod + rate-limit + cache where required)
- ✅ `GET /api/me`
- ✅ `POST /api/me/consent` (➕ beyond blueprint)
- ✅ `POST /api/attendance/check-in` — rate-limited, idempotent per day
- ✅ `POST /api/feedback` — rate-limited, sentiment via `after()`
- ✅ `GET /api/leaderboard` — Redis-cached 60s
- ✅ `POST /api/redemptions` — checks balance + stock
- ✅ `POST /api/admin/rewards` — manual award
- ✅ `POST /api/admin/allocator/cycles` — create draft
- ✅ `POST /api/admin/allocator/generate` — features → LLM → proposal
- ✅ `POST /api/admin/allocator/publish` — idempotent ledger insert + audit + MV refresh + cache invalidate
- ✅ `POST /api/admin/redemptions/[id]/decide` — offsetting ledger row + stock decrement
- ✅ `GET /api/admin/audit/fairness` — DIR + ANOVA + manager skew (cached 1h)
- ✅ `POST /api/admin/users/import` — CSV bulk import
- ✅ `GET /api/admin/export/csv` — ledger / users / redemptions
- ✅ `GET /api/cron/weekly-digest` — Resend digest
- ✅ `GET /api/cron/audit-refresh` — invalidate cache + persist `audit_findings`

### LLM layer
- ✅ [client.ts](src/lib/llm/client.ts) — OpenRouter wrapper with retry + JSON-mode
- ✅ [prompts.ts](src/lib/llm/prompts.ts) — sentiment / allocator / narrator prompts
- ✅ [schemas.ts](src/lib/llm/schemas.ts) — Zod schemas for all three layers
- ✅ [allocator.ts](src/lib/llm/allocator.ts) — clamp 25%, scrub forbidden tokens, scale to pool, KPI-weighted `equalSplit()` fallback
- ✅ [sentiment.ts](src/lib/llm/sentiment.ts) — L1 classifier
- ✅ [narrator.ts](src/lib/llm/narrator.ts) — L3 plain-English bias narrator
- ✅ [features.ts](src/lib/llm/features.ts) — attendance / KPI / sentiment / tenure aggregator (90-day window)

### Audit / fairness layer
- ✅ [disparate-impact.ts](src/lib/audit/disparate-impact.ts) — DIR, pairwise DIR, ANOVA F-test, manager skew (deterministic)
- ✅ [anomalies.ts](src/lib/audit/anomalies.ts) — attendance jump + feedback skew flags
- ✅ `audit_findings` persistence via cron

### Caching & rate limiting
- ✅ [redis.ts](src/lib/redis.ts) — Upstash client + `@upstash/ratelimit` factories (login, kudos, allocator, feedback, check-in)
- ✅ Cache helpers + key conventions
- ✅ Graceful no-op when Redis env missing (dev mode)

### UI primitives & nav
- ✅ [Sidebar.tsx](src/components/nav/Sidebar.tsx) + [TopBar.tsx](src/components/nav/TopBar.tsx)
- ✅ [ThemeProvider](src/components/theme/ThemeProvider.tsx) + [ThemeToggle](src/components/theme/ThemeToggle.tsx) — class-based dark mode + no-flash boot script
- ✅ [Toaster.tsx](src/components/ui/Toaster.tsx) — globally mounted, `toasts.success/error/info`
- ✅ [EmptyState.tsx](src/components/ui/EmptyState.tsx)
- ✅ [Skeleton.tsx](src/components/ui/Skeleton.tsx)
- ✅ [SentimentChip.tsx](src/components/feedback/SentimentChip.tsx)
- ✅ [GoogleButton.tsx](src/components/auth/GoogleButton.tsx)

### Hooks / stores / types
- ✅ [useUser.ts](src/hooks/useUser.ts), [useRealtimeWallet.ts](src/hooks/useRealtimeWallet.ts)
- ✅ [stores/ui.ts](src/stores/ui.ts) — Zustand UI state
- ✅ [types/domain.ts](src/types/domain.ts) — domain types

### Tests
- ✅ [vitest.config.ts](vitest.config.ts)
- ✅ [tests/unit/disparate-impact.test.ts](tests/unit/disparate-impact.test.ts)
- ✅ [tests/unit/allocator.test.ts](tests/unit/allocator.test.ts)
- ✅ [tests/unit/anomalies.test.ts](tests/unit/anomalies.test.ts)
- ✅ pgTAP RLS suite at [supabase/tests/rls.test.sql](supabase/tests/rls.test.sql)

---

## 2. Partial / needs work

- 🟡 **Admin Settings** ([page.tsx](src/app/admin/settings/page.tsx)) — placeholder only. Wire point values, badge rules, AI guardrails toggles.
- 🟡 **CSV import UI** — `/api/admin/users/import` works, but the "Import CSV" button on [admin/users](src/app/admin/users/page.tsx) is not wired to a file picker / form.
- 🟡 **"New KPI" / "New catalog item" buttons** — UI exists but no create form / handler.
- 🟡 **Manual reward UI** — `/api/admin/rewards` exists, but there's no admin form to award points/bonus/badge with reason. Currently API-only.
- 🟡 **Peer kudos UI** — feedback POST supports it server-side, but there is no employee-facing kudos form (`/employee/feedback` is read-only inbox).
- 🟡 **Redemption decline UX** — points are not debited at request time, so reject is a no-op refund-wise. Surface this in the store before pilot.
- 🟡 **`src/types/database.ts`** — hand-rolled. Replace with `npm run db:types` output once Supabase project is provisioned.
- 🟡 **Notifications feature (E-10)** — realtime wallet works, but no in-app notification feed or toast on reward landing.
- 🟡 **Badge unlock flow** — `user_badges` table exists, but no automated unlock rule engine reading `badges.rule_json`. Badges only land via manual admin award.
- 🟡 **Leaderboard scoping** — `?scope=dept&period=month` accepted, but only one variant rendered in UI. Add scope/period toggles per blueprint 4.1 E-06.
- 🟡 **Allocator features quality** — assumes 22 working days/month + 90-day window; tune once production attendance data exists.

---

## 3. Missing

- ⛔ **Custom UI primitive set** — only `Toaster`, `EmptyState`, `Skeleton` exist. Need an in-repo set of accessible primitives (Button, Card, Dialog, Input, Select, Table, Tabs) — built ourselves, not shadcn.
- ⛔ **Tremor / Recharts charts** — Recharts is in `package.json` but no chart components exist. Blueprint section 13 lists `components/charts/{PointsTrend,DistributionByGender,FairnessGauge}.tsx`.
- ⛔ **Confetti on badge unlock** — no animation logic.
- ⛔ **Geofence on attendance check-in** — blueprint E-02 mentions optional geofence; not implemented.
- ⛔ **KPI self-update with evidence URL** — KPI assignments page is read-only; `kpi_assignments.evidence_url` column unused.
- ⛔ **Streak tracking** — blueprint E-02 mentions streaks; nothing computes consecutive check-in days.
- ⛔ **Vercel Analytics** — package not installed / not wired (`@vercel/analytics`).
- ⛔ **OpenRouter spend cap reminder in README** — operational step not documented.

### Removed from scope (per request, 2026-05-10)

- ⛔ Sentry — removed.
- ⛔ GitHub Actions CI — removed (run `npm test` + `supabase test db` locally before deploy).
- ⛔ Playwright E2E — removed (rely on Vitest unit tests + manual smoke).

---

## 4. Suggestions

### High priority before pilot
1. **Wire the manual-reward admin form.** The API is ready; a small form on `/admin/users/[id]` (or a modal on the users table) to award points + reason completes the manual lifecycle and unblocks demos without needing the LLM.
2. **Wire the peer-kudos employee form.** Add a "Send kudos" composer on `/employee/feedback` (or a dedicated `/employee/kudos`). The `/api/feedback` route already accepts it; without a UI the rate-limit / sentiment pipeline goes untested by employees.
3. **Generate real `database.ts`.** Provision Supabase, run `npm run db:types`, and replace the hand-rolled file. Drift here will silently break queries.
4. **Settings page MVP.** Even read-only settings (current point values, allocator caps, model in use) gives admins confidence and unblocks observability without code changes.
5. **Vercel Analytics.** One-line addition: `npm i @vercel/analytics` then `<Analytics />` in `app/layout.tsx`. Replaces the removed Sentry slot for basic perf/usage telemetry.

### Medium priority polish
6. **Build custom UI primitives in `components/ui/`.** Roll our own Button, Card, Dialog, Input, Select, Table, Tabs (no shadcn — keep the bundle small and the theming under our control). Model the API on Radix/Headless UI conventions but write the markup ourselves. Replace bare Tailwind incrementally — the allocator workflow drawer is the highest-leverage candidate.
7. **One Recharts chart on the bias audit page.** A grouped bar chart of mean reward by gender / department would visualise the DIR numbers and replace the text-only stat cards.
8. **Streak + geofence (deferred).** Document explicitly as v2 scope so it's not a surprise gap during demo.
9. **Badge rule engine.** Even a single declarative rule type (e.g. `{ kind: "attendance_streak", days: 30 }`) evaluated nightly would unlock the badges feature without changing the schema.
10. **Notifications drawer.** A Realtime-fed "recent rewards" panel in the TopBar makes the live-update story tangible.

### Operational
11. **Pre-deploy script.** Add `npm run preflight` that runs `tsc --noEmit && npm test` so you have a single command to gate Vercel pushes — replaces the removed GH Actions in spirit.
12. **OpenRouter spend cap.** Set a hard cap in the OpenRouter dashboard before exposing publish to a real cycle; document the cap in README + checkpoint.
13. **Edge function deploy.** `supabase functions deploy on-feedback-insert` + register the database webhook for production-grade sentiment. The in-process `after()` covers dev / demo only.
14. **README operational section.** Add a "Going to production" subsection with the env var checklist + cron verification + edge function deploy steps.

---

## 5. Quick health summary

| Area | State |
|---|---|
| Schema / RLS | ✅ Production-ready |
| Auth | ✅ Production-ready |
| Employee read paths | ✅ Production-ready |
| Employee write paths | 🟡 Kudos form missing |
| Admin read paths | ✅ Production-ready |
| Admin write paths | 🟡 Manual reward / KPI / catalog forms missing |
| Allocator (AI L2) | ✅ Production-ready |
| Sentiment (AI L1) | ✅ Code-complete; edge function needs deploy |
| Narrator (AI L3) | ✅ Production-ready |
| Audit / bias | ✅ Production-ready |
| Caching / rate-limit | ✅ Production-ready |
| Tests | ✅ 17 unit + pgTAP green |
| Observability | ⛔ Need to add `@vercel/analytics` |
| UI polish | 🟡 Bare Tailwind; custom primitive set pending |

**Overall:** the data + API + AI layers are essentially complete. The remaining work is mostly **admin/employee form UIs** (5–6 small client components) and **UI polish** (custom primitive set + one chart). A focused 1–2 day push closes section 2 and most of section 4.
