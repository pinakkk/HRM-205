# Update Required — Gap Analysis & Refactor Plan

> Audit of the current HRM/Reward System codebase against the target Reward System Dashboard spec (Employee + HR/Admin sidebars + Optional advanced features). This doc lists what we **have**, what we need to **add**, what we should **rename/reorder**, and what we can **remove or defer**.

Project root: `/Users/pinak/projects/Hrm-project`
Stack: Next.js 15 (App Router) + React 19 + Supabase (Postgres + RLS + SSR auth) + TanStack Query + Zustand + Tailwind + Recharts + Anthropic SDK + Resend + Upstash.

Roles in DB are `employee | admin` (see [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) and [src/lib/rbac.ts](src/lib/rbac.ts)). The spec uses the term **HR/Admin** — these map 1:1 to our existing `admin` role; no schema change needed unless we want a true 3-role split (HR vs Super-Admin). Recommendation: **keep `admin` for now**, surface as "HR / Admin" in UI copy.

---

## 1. Sidebar — Required Reorder & Rename

### 1a. Employee Sidebar

Current order — [src/app/employee/layout.tsx:17-25](src/app/employee/layout.tsx#L17-L25):
`Dashboard, Attendance, KPIs, Feedback, Leaderboard, Rewards & Points, Bonus, Redeem, Privacy`

Target order (per spec):
`Dashboard, My Profile, Attendance, Performance, Rewards & Points, Badges & Achievements, Bonuses, Feedback, Leaderboard, Notifications, Settings, Logout`

Required changes in [src/app/employee/layout.tsx](src/app/employee/layout.tsx):

| # | Action | Detail |
|---|--------|--------|
| 1 | **ADD** `My Profile` | New route `/employee/profile` — view & edit name, email (read-only), department, role, photo, contact. Currently no profile editor exists. |
| 2 | **RENAME** `KPIs` → `Performance` | Keep the route `/employee/kpis` or migrate to `/employee/performance`. Recommend rename route too for spec alignment. |
| 3 | **ADD** `Badges & Achievements` | New route `/employee/badges`. Badges exist in DB ([badges](supabase/migrations/0001_init.sql), [user_badges](supabase/migrations/0001_init.sql)) but employees have no dedicated page. Today they only show as a card on dashboard. |
| 4 | **RENAME** `Bonus` → `Bonuses` | Cosmetic plural to match spec. |
| 5 | **MERGE** `Redeem` into `Rewards & Points` | Spec lumps redemption under Rewards. Keep `/employee/store` page but link from inside Rewards screen rather than top-level sidebar. (Optional: keep both if reward store is a flagship feature.) |
| 6 | **ADD** `Notifications` | New route `/employee/notifications`. No in-app notification center exists today — only weekly digest emails via Resend. |
| 7 | **MOVE/RENAME** `Privacy` → `Settings` | Current `/employee/consent` page only handles audit consent. Either rename to `/employee/settings` and put consent inside it as a tab, or keep consent as a sub-section under Settings. Settings should also include: password change, notification preferences, theme (theme toggle currently lives in sidebar footer — keep there or move to Settings). |
| 8 | **REORDER** | Apply the spec's exact order. |
| 9 | **Logout** | Already present in sidebar footer ([src/components/nav/Sidebar.tsx:68-76](src/components/nav/Sidebar.tsx#L68-L76)). Spec lists it as a sidebar item — current footer placement is acceptable, no change required. |

### 1b. HR/Admin Sidebar

Current order — [src/app/admin/layout.tsx:18-26](src/app/admin/layout.tsx#L18-L26):
`Dashboard, Employees, Attendance, Approvals, Feedback, Leaderboard, Badges, Reports, Settings`

Hidden/extra admin pages not in sidebar: `/admin/allocator`, `/admin/redemptions`, `/admin/catalog`, `/admin/audit`.

Target order:
`Dashboard, Employee Management, Attendance Management, Performance Management, Reward Management, Bonus Management, Badge Management, Feedback & Reviews, Leaderboard Control, Reports & Analytics, Announcements, Settings, Logout`

Required changes in [src/app/admin/layout.tsx](src/app/admin/layout.tsx):

| # | Action | Detail |
|---|--------|--------|
| 1 | **RENAME** `Employees` → `Employee Management` | route stays `/admin/users` |
| 2 | **RENAME** `Attendance` → `Attendance Management` | |
| 3 | **RENAME** `Approvals` → `Performance Management` | route `/admin/kpis` already covers KPI approval/management; rename for clarity |
| 4 | **ADD** `Reward Management` | New top-level entry. Today the catalog editor (`/admin/catalog`) and redemption queue (`/admin/redemptions`) are unlinked from the sidebar. Create `/admin/rewards` as a hub that links to: catalog editor, redemption approvals, reward rules (new), manual reward issuance (existing API `/api/admin/rewards`). |
| 5 | **ADD** `Bonus Management` | The `/admin/allocator` cycle UI exists but isn't in the sidebar. Add it as `Bonus Management` linking to allocator + cycle history. |
| 6 | **RENAME** `Badges` → `Badge Management` | route stays `/admin/badges` |
| 7 | **RENAME** `Feedback` → `Feedback & Reviews` | |
| 8 | **RENAME** `Leaderboard` → `Leaderboard Control` | |
| 9 | **RENAME** `Reports` → `Reports & Analytics` | |
| 10 | **ADD** `Announcements` | New route `/admin/announcements` — does not exist. Needs DB table + UI. |
| 11 | **EXPAND** `Settings` | Currently a stub ("Coming soon — Phase 5"). Build out: system config, reward configuration, role/permission view, login security toggles, dashboard preferences. |
| 12 | **DECIDE on `/admin/audit`** | Fairness audit page exists but not in spec. Recommend: keep, surface inside `Reports & Analytics` as a tab rather than top-level. |
| 13 | **Logout** | Already in sidebar footer. No change. |

---

## 2. Feature-by-Feature Gap Matrix

Legend: ✅ done · 🟡 partial · ❌ missing

### 2a. Employee Dashboard

| Spec Item | Status | Current Location | Action |
|-----------|--------|------------------|--------|
| Dashboard | ✅ | [src/app/employee/page.tsx](src/app/employee/page.tsx) | Verify it surfaces: points summary, attendance, performance score, badges, recent updates. Add "recent updates" feed if missing. |
| My Profile | ❌ | none | **Build** `/employee/profile` page. Use existing `users` table fields + add `phone`, `photo_url`, `bio` columns via new migration. Wire to Supabase storage for photos. |
| Attendance | ✅ | [src/app/employee/attendance/page.tsx](src/app/employee/attendance/page.tsx) | Add monthly % calc to UI if not shown. Add leave records section (no `leaves` table today — see §4). |
| Performance | ✅ | [src/app/employee/kpis/page.tsx](src/app/employee/kpis/page.tsx) | Rename label. Add monthly perf report PDF export (nice-to-have). |
| Rewards & Points | ✅ | [src/app/employee/rewards/page.tsx](src/app/employee/rewards/page.tsx) | Add "available rewards" preview + "eligibility" check (rules engine missing — see §4). |
| Badges & Achievements | 🟡 | dashboard card only | **Build** `/employee/badges` listing earned + unearned with progress toward criteria. Data already in `user_badges`. |
| Bonuses | ✅ | [src/app/employee/bonus/page.tsx](src/app/employee/bonus/page.tsx) | Rename label. |
| Feedback | ✅ | [src/app/employee/feedback/page.tsx](src/app/employee/feedback/page.tsx) | Add "self-feedback / suggestions" submission form (spec calls this out explicitly). |
| Leaderboard | ✅ | [src/app/employee/leaderboard/page.tsx](src/app/employee/leaderboard/page.tsx) | OK |
| Notifications | ❌ | none | **Build** notifications system. New table + `/employee/notifications` page + bell icon in TopBar. See §4. |
| Settings | 🟡 | `/employee/consent` only | **Refactor** consent → settings hub. Add password change (Supabase Auth), notification prefs, theme. |
| Logout | ✅ | [src/components/nav/Sidebar.tsx:68](src/components/nav/Sidebar.tsx#L68) | OK |

### 2b. HR/Admin Dashboard

| Spec Item | Status | Current Location | Action |
|-----------|--------|------------------|--------|
| Dashboard | ✅ | [src/app/admin/page.tsx](src/app/admin/page.tsx) | Verify totals: total employees, active count, attendance stats, reward distribution, perf summary, system activity. Replace any hardcoded mock values with live aggregates. |
| Employee Management | ✅ | [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx) | Confirm full CRUD (add/edit/delete). Currently has import; verify edit + delete UI. |
| Attendance Management | ✅ | [src/app/admin/attendance/page.tsx](src/app/admin/attendance/page.tsx) | Add leave approval workflow (no `leaves` table — see §4). |
| Performance Management | ✅ | [src/app/admin/kpis/page.tsx](src/app/admin/kpis/page.tsx) | Add KPI assignment UI (today it's mostly approval). Verify monthly perf report generation. |
| Reward Management | 🟡 | catalog + redemption pages exist but unlinked | **Add sidebar entry** + create reward-rules editor + reward-categories. |
| Bonus Management | 🟡 | allocator exists but unlinked | **Add sidebar entry** for `/admin/allocator`. Add bonus history view. |
| Badge Management | ✅ | [src/app/admin/badges/page.tsx](src/app/admin/badges/page.tsx) | Verify badge auto-award rules UI exists (rule_json column is there; UI may be missing). |
| Feedback & Reviews | ✅ | [src/app/admin/feedback/page.tsx](src/app/admin/feedback/page.tsx) | Replace any hardcoded data with live aggregates. |
| Leaderboard Control | ✅ | [src/app/admin/leaderboard/page.tsx](src/app/admin/leaderboard/page.tsx) | Add "Employee of the Month" selection UI (currently mock). |
| Reports & Analytics | ✅ | [src/app/admin/reports/page.tsx](src/app/admin/reports/page.tsx) | Add PDF export (CSV exists at `/api/admin/export/csv`). |
| Announcements | ❌ | none | **Build** `/admin/announcements` + `announcements` table. See §4. |
| Settings | 🟡 (stub) | [src/app/admin/settings/page.tsx](src/app/admin/settings/page.tsx) | **Build out** — see §3.2. |
| Logout | ✅ | sidebar footer | OK |

### 2c. Optional Advanced Features

| Spec Item | Status | Action |
|-----------|--------|--------|
| Employee of the Month | 🟡 mock | Promote the dashboard card to a real feature: monthly cron computes top performer (perf + attendance + points), stored in new `employee_of_month` table; admin can override. |
| Reward Store | ✅ | [src/app/employee/store/page.tsx](src/app/employee/store/page.tsx) — done. |
| QR Attendance | ❌ | Add `/api/attendance/qr` endpoint that validates a rotating signed token; admin page generates QR; employee page scans (use camera API or accept QR-link). |
| Real-Time Notifications | ❌ | Use Supabase Realtime (postgres_changes on `notifications` table). Bell icon in TopBar subscribes per-user. |
| AI Performance Suggestions | 🟡 | We have Anthropic SDK + allocator + sentiment + narrator in [src/lib/llm/](src/lib/llm/). Add per-employee suggestion generator that ingests KPI history, attendance, feedback sentiment → personalised improvement tips on the Performance page. |
| Gamification Levels | ❌ | Derive from lifetime points (from [points_balance](supabase/migrations/0003_views.sql) view). Define tiers Beginner/Performer/Achiever/Expert/Champion in code (no schema change needed). Show on profile + leaderboard. |
| Daily Streaks | ❌ | Compute from `attendance` table (consecutive workdays with check-in). Add `streak` field to employee dashboard + badge auto-award rule (e.g. "30-day streak"). |

---

## 3. New Pages / Routes To Build

### 3.1 Employee-side (5 new routes)
1. `src/app/employee/profile/page.tsx` — view/edit profile
2. `src/app/employee/badges/page.tsx` — earned + locked badges with progress
3. `src/app/employee/notifications/page.tsx` — notification center
4. `src/app/employee/settings/page.tsx` — settings hub (replaces standalone `/consent`, makes consent a tab)
5. (Optional) `src/app/employee/streaks/page.tsx` if we want a dedicated streak page; otherwise surface on dashboard.

### 3.2 Admin-side (3 new + Settings rebuild)
1. `src/app/admin/announcements/page.tsx` — list + compose announcement
2. `src/app/admin/rewards/page.tsx` — Reward Management hub (links to catalog/redemptions/rules)
3. Surface `/admin/allocator` as **Bonus Management** in sidebar (no new file, just link)
4. Rebuild `src/app/admin/settings/page.tsx` with sections:
   - System settings (timezone, work-week)
   - Reward configuration (point values per action, redemption thresholds)
   - User roles & permissions (read-only for now)
   - Login security (require email confirm, session length)
   - Dashboard preferences (default landing tab, density)

---

## 4. Database / Schema Changes

New migration `0008_phase2_features.sql` proposed:

| Table / Column | Purpose |
|----------------|---------|
| `notifications` (id, user_id, type, title, body, link, read_at, created_at) | In-app notifications |
| `announcements` (id, author_id, title, body, audience, pinned, published_at) | HR broadcasts |
| `leaves` (id, user_id, start_date, end_date, type, status, approver_id, reason) | Leave management referenced by spec under Attendance |
| `users.phone`, `users.photo_url`, `users.bio` | Profile fields |
| `users.notification_prefs` (jsonb) | Per-user notification preferences |
| `attendance_streaks` *(optional, can be view)* | Cached streak per user |
| `employee_of_month` (month, user_id, score, locked_by) | Promote mock card to real data |
| `reward_rules` (id, name, trigger, points, active) | Configurable point-award rules referenced by spec |

RLS: each table needs the same employee-only-self / admin-all pattern used by [0002_rls.sql](supabase/migrations/0002_rls.sql).

Realtime: enable Supabase Realtime publication on `notifications` and `announcements`.

---

## 5. New API Routes

- `POST /api/notifications/[id]/read` — mark read
- `GET  /api/notifications` — paginated list
- `POST /api/announcements` (admin) + `GET /api/announcements`
- `POST /api/leaves` (employee), `POST /api/admin/leaves/[id]/decide`
- `POST /api/attendance/qr` — QR check-in (with rotating token verification)
- `POST /api/me/profile` — update profile fields
- `POST /api/me/password` — password change (proxy to Supabase auth)
- `POST /api/admin/eotm/[month]` — set/override employee of the month
- `GET  /api/me/suggestions` — AI performance suggestions (Anthropic call)
- `GET  /api/me/level` — gamification tier (computed)

---

## 6. Components To Add / Refactor

| Component | Where | Notes |
|-----------|-------|-------|
| `NotificationBell` | TopBar | dropdown + unread count, subscribes via Supabase Realtime |
| `ProfileForm` | employee profile page | uses existing `users` table; add Supabase Storage for photo |
| `BadgeGrid` | employee badges page | earned vs locked, progress bars from `rule_json` |
| `AnnouncementCard` / `AnnouncementComposer` | admin + employee dashboards | |
| `LevelBadge` | leaderboard, profile | derives tier from points |
| `StreakCounter` | dashboard | reads from attendance |
| `QRGenerator` (admin) / `QRScanner` (employee) | new pages | |
| `SettingsTabs` | both employee & admin settings | |

---

## 7. What To Remove / Deprecate

Keep almost everything — the codebase is solid. Only soft-removals:

1. **Top-level "Privacy" sidebar item** — fold into Settings.
2. **Stub admin Settings copy** ("Coming soon — Phase 5") — replace with real UI.
3. **Hardcoded mock data** in admin dashboard cards (e.g. monthly top performers, feedback summary if any) — replace with live aggregates.
4. **Sidebar `Redeem` standalone entry** — optional fold into Rewards & Points (decide based on UX preference; keeping it is also defensible since Reward Store is a flagship feature).
5. Don't remove `/admin/audit` or `/admin/allocator` — they're valuable; just resurface them under the renamed sidebar entries (Reports & Analytics, Bonus Management).

---

## 8. Suggested Phased Rollout

**Phase 1 — Sidebar refactor & renames (low risk, 1 day)**
- Reorder + rename items in both layouts
- Add placeholder pages for Profile, Badges, Notifications, Announcements, Settings (admin), Reward Management (link to existing), Bonus Management (link to allocator)

**Phase 2 — Profile & Settings (2–3 days)**
- Profile DB migration + page + API
- Employee Settings hub (subsumes consent)
- Admin Settings build-out

**Phase 3 — Notifications + Announcements + Realtime (3–4 days)**
- DB tables, RLS, API
- NotificationBell component, Realtime subscription
- Announcement compose/feed

**Phase 4 — Badges page, Leaves, Employee of the Month (2–3 days)**
- Employee `/badges` page
- `leaves` table + workflow
- Employee of the Month real data

**Phase 5 — Optional advanced (1–2 weeks)**
- QR attendance
- AI performance suggestions (per-employee)
- Gamification levels
- Daily streaks

---

## 9. Open Questions / Decisions Needed

1. **HR vs Admin split** — keep single `admin` role or introduce distinct `hr` role with narrower permissions? (DB CHECK constraint would change.)
2. **Reward Store vs Rewards & Points** — keep as separate sidebar items or merge?
3. **Privacy/Consent** — keep audit consent visible as its own surface or hide inside Settings?
4. **Employee of the Month** — fully automated cron, admin-curated, or hybrid (suggest + override)?
5. **Notifications channel mix** — in-app only, or in-app + email digest (existing) + push?
6. **Theme toggle location** — stay in sidebar footer or move to Settings?

Resolve before starting Phase 2.
