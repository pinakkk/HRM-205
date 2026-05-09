# FairReward AI — Build Checkpoint

> Snapshot as of 2026-05-10.
> Refer to `blueprint.md` for the full design; this file tracks **what's done** and **what's next** so anyone (you, your teammate, a future agent) can pick up cleanly.

---

## ✅ What's done

### Phase 0 — Setup

- [x] Next.js 15 (App Router), TypeScript strict, Tailwind 3, ESLint + Prettier, `vercel.json` (Mumbai region + cron config), `tsconfig.json` with `@/*` path alias.
- [x] Dependencies declared in `package.json`. Run `npm install` once.
- [x] Env templates — `.env.example` and a populated `.env.local` (gitignored).
- [x] Env validation — `src/lib/env.ts` (lenient defaults so the app builds without secrets; tighten later).

### Phase 1 — Auth & Schema

- [x] Supabase migrations:
  - `0001_init.sql` — 13 tables + indexes + `handle_new_user` trigger.
  - `0002_rls.sql` — RLS + `is_admin()` helper + per-table policies.
  - `0003_views.sql` — `points_balance` MV + `leaderboard` view.
  - `0004_seed_meta.sql` — badges + catalog items.
  - `0005_oauth_metadata.sql` — Google OAuth metadata mapping.
  - `0006_consent.sql` — `consent_at` / `consent_version` columns + self-update RLS policy.
- [x] Supabase client trio — `lib/supabase/{server,browser,admin,middleware}.ts`.
- [x] Auth flow — `/login`, `/signup`, `/auth/callback`, `/auth/sign-out`.
- [x] Middleware — session refresh + role gate.
- [x] Server guards — `requireUser()` / `requireAdmin()`.

### Phase 2 — Employee Surface

- [x] Shared nav (Sidebar + TopBar with dark-mode toggle).
- [x] Employee panel under `/employee/*`: dashboard, attendance, KPIs, feedback inbox (sentiment chips), leaderboard, redemption store, **privacy / consent** screen.
- [x] Realtime wallet hook — `hooks/useRealtimeWallet.ts`.

### Phase 3 — Admin Surface & Manual Rewards

- [x] Admin panel under `/admin/*`: overview, users, KPIs, allocator (index + cycle workflow), bias audit, redemptions queue with approve/reject, catalog, settings.
- [x] Allocator — full **Generate → edit amounts → rationale drawer → Publish** flow against real attendance/KPI/feedback aggregates.
- [x] Redemptions — approve writes offsetting ledger row, decrements stock, refreshes MV, invalidates caches, writes `audit_log`.

### Phase 4 — AI Layer

- [x] **Sentiment (L1)** — feedback POST inlines `classifySentiment()` via Next.js `after()` so the UX never blocks; the `on-feedback-insert` Supabase edge function remains the canonical path for production.
- [x] Sentiment chips render in the employee feedback inbox.
- [x] **Allocator (L2)** — `proposeAllocation()` with retry / Zod validation / server-side clamp (25% cap, forbidden-token scrub, scale-down) and KPI-weighted `equalSplit()` fallback.
- [x] **Bias narrator (L3)** — `lib/llm/narrator.ts` `proposeBiasNarration()` reads the deterministic stats and produces a JSON `{ headline, paragraphs[], recommendations[] }`. Cached for 1h under `audit:narration`. Audit page renders the headline + paragraphs + recommendations or a clear "narrator unavailable" state.
- [x] **Audit refresh cron** (`/api/cron/audit-refresh`) invalidates the cached summary + narration **and** runs `attendanceJumpFlags` + `feedbackSkewFlags` over the last 28 days, persisting hits into `audit_findings`.
- [x] **Weekly digest cron** (`/api/cron/weekly-digest`) groups the past 7 days of ledger activity per user and dispatches HTML emails via Resend (graceful no-op when `RESEND_API_KEY` is unset).
- [x] **Models** — defaults switched to OpenAI GPT via OpenRouter: `openai/gpt-4o-mini` for sentiment + narrator, `openai/gpt-4o` for the allocator. Override per-env if needed.

### Phase 5 — Polish

- [x] **Dark mode** — class-based Tailwind toggle, `ThemeProvider` + `ThemeToggle` in `TopBar`, no-flash inline boot script in `<head>`.
- [x] **Toasts** — lightweight `Toaster` mounted globally; usage: `toasts.success("…")` / `toasts.error("…")` / `toasts.info("…")`.
- [x] **Skeleton + EmptyState** primitives in `components/ui/`.
- [x] **Consent screen** at `/employee/consent` — DPDP-aligned opt-in for gender used in fairness audits; `/api/me/consent` records `consent_at`, `consent_version`, and toggles `gender`.

### Phase 6 — Testing

- [x] **Vitest** unit suite under `tests/unit/`:
  - `disparate-impact.test.ts` — DIR / pairwise DIR / ANOVA / manager skew.
  - `allocator.test.ts` — `clamp()` cap, forbidden-token scrub, unknown-user drop, scale-down; `equalSplit()` fallback.
  - `anomalies.test.ts` — `attendanceJumpFlags` and `feedbackSkewFlags`.
  - 17 tests, all green. `npm test`.
- [x] **pgTAP** RLS test under `supabase/tests/rls.test.sql` — Alice can only read her own rows / can't spoof Bob; Bob can read feedback addressed to him; admin sees every ledger row. Run via `supabase test db`.

### API surface

| Method | Path | Status |
| --- | --- | --- |
| `GET`  | `/api/me` | ✅ profile + balance |
| `POST` | `/api/me/consent` | ✅ DPDP opt-in |
| `POST` | `/api/attendance/check-in` | ✅ rate-limited, idempotent per day |
| `POST` | `/api/feedback` | ✅ Zod-validated, rate-limited, sentiment via `after()` |
| `GET`  | `/api/leaderboard` | ✅ Redis-cached (60s) |
| `POST` | `/api/redemptions` | ✅ checks balance + stock |
| `POST` | `/api/admin/rewards` | ✅ manual award → ledger |
| `POST` | `/api/admin/allocator/cycles` | ✅ creates draft cycle |
| `POST` | `/api/admin/allocator/generate` | ✅ real aggregates → LLM proposal |
| `POST` | `/api/admin/allocator/publish` | ✅ idempotent, ledger insert, audit, MV refresh |
| `POST` | `/api/admin/redemptions/[id]/decide` | ✅ approve/reject with ledger offset |
| `GET`  | `/api/admin/audit/fairness` | ✅ DIR + ANOVA + manager skew |
| `POST` | `/api/admin/users/import` | ✅ bulk-creates auth users + profiles |
| `GET`  | `/api/admin/export/csv` | ✅ ledger / users / redemptions |
| `GET`  | `/api/cron/weekly-digest` | ✅ Resend digest |
| `GET`  | `/api/cron/audit-refresh` | ✅ invalidate cache + persist anomaly findings |

---

## 🟡 Known gaps / pending operational steps

- **Production deploy** — push to `main`, point `fairreward.app`, set Vercel env vars (Supabase, Upstash, OpenRouter, Resend), enable cron in `vercel.json`.
- **Edge function deploy** — `supabase functions deploy on-feedback-insert` and register the database webhook for production-grade sentiment tagging. The in-process `after()` call covers dev / demo.
- **Lighthouse / a11y polish** — final pass before launch.
- **Database types** — `src/types/database.ts` is hand-rolled. Replace with `npm run db:types` output once the project is provisioned.
- **Allocator features quality** — assumes 22 working days per month + 90-day window; tune once production attendance data lands.
- **Redemption decline UX** — no points are debited at request time, so reject is a no-op refund-wise. Communicate this in the employee store before pilot.

---

## How to pick up

### Provision + run

1. Provision Supabase, Upstash, OpenRouter, Resend; paste keys into `.env.local`.
2. `npm install`
3. `supabase db push` (applies migrations) and `supabase test db` (RLS pgTAP).
4. `npm run seed` (creates 1 admin + 5 demo employees).
5. `npm run dev` → http://localhost:3000.

### Hand-off areas

- **Styling** — pages render server-side with Tailwind utilities; safe to restyle without touching data logic. The allocator workflow drawer (`src/app/admin/allocator/[cycleId]/workflow.tsx`) and consent form (`src/app/employee/consent/form.tsx`) are isolated client components.
- **Phase 4 ops** — deploy the edge function for sentiment, set the Resend domain/sender, validate the cron schedules in `vercel.json`.

---

## Files of note

```
src/
├── app/
│   ├── (auth)/{login,signup}/   # client forms
│   ├── auth/{callback,sign-out}/route.ts
│   ├── employee/                # 7 pages incl. consent
│   ├── admin/                   # 8 pages incl. allocator workflow + redemption decision-buttons
│   └── api/                     # route handlers incl. allocator cycles/generate/publish + redemptions/decide + me/consent + crons
├── components/
│   ├── nav/{Sidebar,TopBar}.tsx
│   ├── theme/{ThemeProvider,ThemeToggle}.tsx
│   ├── feedback/SentimentChip.tsx
│   └── ui/{Toaster,EmptyState,Skeleton}.tsx
├── lib/
│   ├── supabase/{server,browser,admin,middleware}.ts
│   ├── redis.ts                 # cache + ratelimit
│   ├── llm/{client,schemas,prompts,allocator,sentiment,narrator,features}.ts
│   ├── audit/{disparate-impact,anomalies}.ts
│   ├── auth.ts rbac.ts env.ts http.ts utils.ts
├── hooks/{useUser,useRealtimeWallet}.ts
├── stores/ui.ts
├── types/{database,domain}.ts
└── middleware.ts                # session refresh + role gate

supabase/
├── migrations/0001-0006*.sql
├── functions/on-feedback-insert/index.ts
├── tests/rls.test.sql           # pgTAP suite
└── config.toml

tests/unit/                      # vitest
├── disparate-impact.test.ts
├── allocator.test.ts
└── anomalies.test.ts

scripts/seed.ts
```

---

## Risks / things to remember

- **Service-role client** (`lib/supabase/admin.ts`) bypasses RLS — only import from server-only files.
- **Hand-rolled `types/database.ts`** — drift will silently break queries. Regenerate after every migration.
- **Rate limiters silently no-op** when Redis isn't configured. Fine for dev; add a startup-time check before staging.
- **`equalSplit` fallback** ensures the allocator still works without an OpenRouter key.
- **Allocator features** read from the live tables via the service-role client. Make sure new tables you add to the feature pipeline get reviewed for PII leakage in `rationale_json`.
- **Sentiment via `after()`** runs in the server response post-flight. If the function instance is killed mid-flight (unlikely but possible on serverless), the row will simply remain with `sentiment = null` — the audit dashboard tolerates this.
- **GPT-4o cost** — the allocator uses `openai/gpt-4o`. Set an OpenRouter spend cap before exposing the publish flow to a real cycle.
