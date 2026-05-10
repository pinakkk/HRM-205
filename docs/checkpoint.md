# FairReward AI — Build Checkpoint

> Snapshot updated 2026-05-10 after the **Phase 7 spec-alignment refactor**.
> Refer to [blueprint.md](blueprint.md) §4 for the canonical sidebar order and §18 Phase 7 for what landed.
> See [updaterequired.md](updaterequired.md) for the gap-analysis that drove this refactor.

---

## Phase 7 — Spec alignment & advanced features (NEW)

The product now matches the production sidebar spec exactly (12 items employee, 13 items HR/Admin) plus all 7 optional advanced features.

### Schema additions

Migration [0008_phase2_features.sql](../supabase/migrations/0008_phase2_features.sql) adds:

- **users**: `phone`, `bio`, `notification_prefs jsonb` columns.
- **notifications** — in-app feed (polled by bell every 30s).
- **announcements** — HR broadcasts with audience filter, fan-out to notifications on insert.
- **leaves** — employee request + admin decide flow.
- **reward_rules** — config-only point-award rules surfaced on admin Settings.
- **employee_of_month** — one row per (year, month).

All five new tables ship with RLS policies (employee-self-read / admin-write) matching the existing pattern in [0002_rls.sql](../supabase/migrations/0002_rls.sql). Hand-rolled types in [src/types/database.ts](../src/types/database.ts) updated to mirror.

### New / refactored routes (employee)

| Sidebar order | Route | Status |
| --- | --- | --- |
| 1. Dashboard | `/employee` | rewritten — level + streak + EOTM banner + announcements + recent rewards |
| 2. My Profile | `/employee/profile` | **new** — view + edit (full_name, phone, bio, avatar_url) |
| 3. Attendance | `/employee/attendance` | rewritten — live data, streak, attendance %, leave history, **QR check-in** |
| 4. Performance | `/employee/performance` | renamed from `/employee/kpis` + AI suggestions panel |
| 5. Rewards & Points | `/employee/rewards` | unchanged (links to `/employee/store` for redemption) |
| 6. Badges & Achievements | `/employee/badges` | **new** — earned vs locked grid with rarity tiers |
| 7. Bonuses | `/employee/bonus` | unchanged |
| 8. Feedback | `/employee/feedback` | unchanged |
| 9. Leaderboard | `/employee/leaderboard` | unchanged |
| 10. Notifications | `/employee/notifications` | **new** — list + mark-all-as-read |
| 11. Settings | `/employee/settings` | **new** — subsumes the deleted `/employee/consent`; notification prefs + DPDP consent |
| 12. Logout | sidebar footer | unchanged |

### New / refactored routes (HR / Admin)

| Sidebar order | Route | Status |
| --- | --- | --- |
| 1. Dashboard | `/admin` | rewritten — live stats (presence today, pending leaves/redemptions, points/bonus 30d), EOTM card, announcements |
| 2. Employee Management | `/admin/users` | unchanged |
| 3. Attendance Management | `/admin/attendance` | rewritten — leave-approval queue (approve/reject), QR poster (rotating token), live stats |
| 4. Performance Management | `/admin/kpis` | renamed in sidebar (route same) |
| 5. Reward Management | `/admin/rewards` | **new hub** — manual award form + ledger feed + links to catalog / redemption queue / reward rules / allocator |
| 6. Bonus Management | `/admin/allocator` | now in sidebar |
| 7. Badge Management | `/admin/badges` | unchanged |
| 8. Feedback & Reviews | `/admin/feedback` | unchanged |
| 9. Leaderboard Control | `/admin/leaderboard` | rewritten — live leaderboard + EOTM selector + suggestion |
| 10. Reports & Analytics | `/admin/reports` | unchanged (audit linked from here) |
| 11. Announcements | `/admin/announcements` | **new** — composer + recent list, fans out notifications |
| 12. Settings | `/admin/settings` | rewritten from stub — reward rules, AI guardrails, system info, security, compliance |
| 13. Logout | sidebar footer | unchanged |

`/employee/kpis` and `/employee/consent` and the mock components (`attendance-components.tsx`, `attendance-admin-components.tsx`, `leaderboard-admin-components.tsx`, `DashboardCharts.tsx`, `AdminCharts.tsx`) were **deleted**, not deprecated — there is no backwards-compatibility shim.

### New API routes

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/me/profile` | Update name / phone / bio / avatar URL |
| `POST` | `/api/me/profile/prefs` | Update notification preferences |
| `GET`  | `/api/me/notifications` | List + unread count |
| `POST` | `/api/me/notifications/read` | Mark all (or one) as read |
| `GET`  | `/api/me/announcements` | Recent announcement feed |
| `GET`  | `/api/me/suggestions` | AI performance tips (LLM when key set, deterministic fallback otherwise) |
| `POST` | `/api/leaves` | Submit leave request |
| `POST` | `/api/admin/leaves/[id]/decide` | Approve / reject leave (notifies user) |
| `POST` | `/api/admin/announcements` | Create announcement + fan out notifications |
| `POST` | `/api/admin/eotm` | Set / override Employee of the Month + notify winner |
| `POST` | `/api/attendance/qr` | Check in with signed QR token (HMAC, 5-min rotation) |
| `GET`  | `/api/admin/attendance/qr-token` | Issue current QR token for the office poster |
| `POST` | `/api/admin/rewards` | (existing) now also writes a notification to the recipient |

### New libraries

- [src/lib/gamification.ts](../src/lib/gamification.ts) — `levelFromPoints` / `progressToNext` (Beginner → Champion).
- [src/lib/streaks.ts](../src/lib/streaks.ts) — `currentStreak` and `attendancePercent` from check-in ISOs.
- [src/lib/qr-token.ts](../src/lib/qr-token.ts) — HMAC-signed token for QR attendance.
- [src/lib/notifications.ts](../src/lib/notifications.ts) — server-side `notify` / `notifyMany` fan-out.

### New UI

- [NotificationBell](../src/components/notifications/NotificationBell.tsx) — mounted in sidebar footer for employees, polls `/api/me/notifications` every 30s.
- Badge grid, profile form, settings tabs, manual-award form, EOTM selector, leave decision row, QR poster, AI suggestions panel — all in their respective route folders.

### Tests added

- [tests/unit/gamification.test.ts](../tests/unit/gamification.test.ts) — tier boundaries + progress monotonicity.
- [tests/unit/streaks.test.ts](../tests/unit/streaks.test.ts) — streak / attendance% bounds.
- [tests/unit/qr-token.test.ts](../tests/unit/qr-token.test.ts) — HMAC verify / reject garbage / reject truncated sigs.

Total: **29 unit tests** passing (was 17). pgTAP RLS suite unchanged.

### Seed expansion

[scripts/seed.ts](../scripts/seed.ts) now creates a fully demo-able state from one command:

- 1 admin + 8 employees across HR / Engineering / Sales / Marketing / Finance.
- 60 days of attendance per employee (with realistic late arrivals + absences + QR sources).
- KPI assignments (3 per employee) with random achieved/target ratios.
- ~60 ledger rows (points + bonus + kudos) attributed to the admin.
- ~20 peer feedback rows tagged with sentiment.
- 4 reward rules, 6 badges (auto-awarded "First Check-in" to all + extra badges to top performer), 5 catalog items.
- 3 announcements (one pinned, one engineering-only).
- ~32 notifications (mix read/unread).
- 5 leave requests (mixed pending / approved / rejected).
- Last month's Employee of the Month set with reason.

Re-running is idempotent for users; everything else is guarded against duplicates.

---

## ✅ What's done (rolled up from earlier phases)

### Phase 0 – 1: Setup, schema, auth
- Next.js 15 / TS strict / Tailwind 3 / `@/*` alias / Vercel Mumbai region + cron config.
- Migrations 0001–0008. RLS, MV, OAuth metadata, consent fields, admin intent tokens, Phase-7 features.
- Supabase client trio + middleware + role-gated guards (`requireUser`, `requireAdmin`).

### Phase 2 – 3: Employee + admin surfaces, manual rewards
- All routes listed in §1 above. CSV import endpoint + redemption queue with approve/reject.
- Manual reward form now shipped (was API-only before Phase 7).

### Phase 4: AI layer
- L1 sentiment via `after()` (edge function exists for prod), L2 allocator with 25% cap + scrub + `equalSplit()` fallback, L3 narrator (cached 1h).
- Phase 7 adds **L1.5 per-employee performance suggestions** (`/api/me/suggestions`), with deterministic fallback when no LLM key.

### Phase 5: Polish
- Dark mode, toasts, skeleton, EmptyState. Phase 7 adds the live notification bell.

### Phase 6: Testing
- 17 vitest unit tests + pgTAP RLS suite. Phase 7 adds 12 more unit tests (gamification, streaks, qr-token).

---

## 🟡 Known gaps / pending operational steps

- **Production deploy** — push to `main`, set Vercel env vars (Supabase, Upstash, OpenRouter, Resend, **`QR_ATTENDANCE_SECRET` recommended** — falls back to service role key when unset), enable cron in `vercel.json`.
- **Edge function deploy** — `supabase functions deploy on-feedback-insert` for production-grade sentiment tagging.
- **Realtime upgrade** — bell currently polls every 30s. To switch to Supabase Realtime, replace the `setInterval` in [NotificationBell](../src/components/notifications/NotificationBell.tsx) with a `postgres_changes` subscription on the `notifications` table. Schema is already realtime-friendly.
- **AI suggestions** — when `OPENROUTER_API_KEY` is unset the deterministic fallback runs (no error). Set the cap before exposing to a real org.
- **Reward rules engine** — the `reward_rules` table is read-only in the UI today. A nightly cron evaluating rules (e.g. attendance_streak_30 → award points + badge) is the natural next step; the table + helpers (`currentStreak`) are ready.
- **Database types** — still hand-rolled in [src/types/database.ts](../src/types/database.ts). Replace with `npm run db:types` output once Supabase project is provisioned.

---

## How to pick up

### Provision + run
1. Provision Supabase, Upstash, OpenRouter, Resend; paste keys into `.env.local`.
2. `npm install`
3. `supabase db push` (applies all 8 migrations) and `supabase test db` (RLS pgTAP).
4. `npm run seed` (creates 1 admin + 8 demo employees + activity).
5. `npm run dev` → http://localhost:3000.

Sign in as `admin@fairreward.dev` / `Password123!` (admin) or any `<name>@fairreward.dev` / `Password123!` (employee).

### Verify
- `npm test` → 29 tests green.
- `npm run typecheck` → clean.
- `npm run build` → clean (warnings only on pre-existing pages).

---

## Files of note

```
src/
├── app/
│   ├── employee/{,profile,attendance,performance,rewards,badges,bonus,feedback,leaderboard,notifications,settings,store}/page.tsx
│   ├── admin/{,users,attendance,kpis,rewards,allocator,badges,feedback,leaderboard,reports,announcements,settings,catalog,redemptions,audit}/page.tsx
│   └── api/
│       ├── me/{profile,profile/prefs,notifications,notifications/read,suggestions,announcements,consent}/route.ts
│       ├── attendance/{check-in,qr}/route.ts
│       ├── leaves/route.ts
│       └── admin/{rewards,announcements,eotm,leaves/[id]/decide,attendance/qr-token,…}/route.ts
├── components/
│   ├── nav/{Sidebar,TopBar}.tsx
│   ├── notifications/NotificationBell.tsx
│   ├── theme/{ThemeProvider,ThemeToggle}.tsx
│   ├── feedback/SentimentChip.tsx
│   └── ui/{Toaster,EmptyState,Skeleton,ChatBot}.tsx
├── lib/
│   ├── gamification.ts streaks.ts qr-token.ts notifications.ts        ← Phase 7
│   ├── supabase/{server,browser,admin,middleware}.ts
│   ├── llm/{client,schemas,prompts,allocator,sentiment,narrator,features}.ts
│   ├── audit/{disparate-impact,anomalies}.ts
│   └── auth.ts rbac.ts env.ts http.ts utils.ts
├── types/{database,domain}.ts
└── middleware.ts

supabase/
├── migrations/0001-0008*.sql
├── functions/on-feedback-insert/index.ts
└── tests/rls.test.sql

tests/unit/
├── disparate-impact.test.ts allocator.test.ts anomalies.test.ts        ← Phase 6
└── gamification.test.ts streaks.test.ts qr-token.test.ts               ← Phase 7

scripts/seed.ts
```

---

## Risks / things to remember

- **Service-role client** (`lib/supabase/admin.ts`) bypasses RLS — only import from server-only files.
- **QR token secret** — defaults to `SUPABASE_SERVICE_ROLE_KEY` when `QR_ATTENDANCE_SECRET` unset. Set the dedicated secret in production so rotating the service role doesn't invalidate every poster simultaneously.
- **Notification fan-out** in [/api/admin/announcements](../src/app/api/admin/announcements/route.ts) reads `notification_prefs.in_app` — users who turn this off are skipped.
- **EOTM** on the dashboard reads from `employee_of_month` — when no row exists for the current (year, month), the card prompts admin to set one.
- **AI suggestions** never throw — they always degrade to the deterministic rule path. Safe to expose without an OpenRouter key for demos.
- **Sidebar bell** is employee-only; admins do not see it (admin actions write to `audit_log`, not user notifications).
