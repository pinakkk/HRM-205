# FairReward AI — Production Blueprint

> A bias-aware, AI-assisted Reward & Compensation system.
> **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS + Realtime) · Upstash Redis · OpenRouter (LLM) · Vercel

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution & Approach](#3-proposed-solution--approach)
4. [Core Feature Set](#4-core-feature-set)
5. [Technical Stack](#5-technical-stack)
6. [System Architecture](#6-system-architecture)
7. [Data Flow Diagrams (DFD)](#7-data-flow-diagrams-dfd)
8. [Data Model & Database Schema](#8-data-model--database-schema)
9. [Row-Level Security (RLS) Strategy](#9-row-level-security-rls-strategy)
10. [AI Integration Design](#10-ai-integration-design)
11. [Caching, Rate Limiting & Realtime](#11-caching-rate-limiting--realtime)
12. [API Surface](#12-api-surface)
13. [Project Structure](#13-project-structure)
14. [UI / UX Design System](#14-ui--ux-design-system)
15. [Security & Privacy](#15-security--privacy)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment & DevOps (Vercel)](#17-deployment--devops-vercel)
18. [Phased Build Plan](#18-phased-build-plan)
19. [Risk Register & Mitigations](#19-risk-register--mitigations)
20. [Future Roadmap](#20-future-roadmap)

---

## 1. Executive Summary

**FairReward AI** is a production-grade web application that helps HR teams allocate rewards (points, bonuses, badges) to employees in a way that is **transparent, data-driven, and demonstrably fair**. It combines two ideas:

- **(A) Bias-Aware Rewards Engine** — AI analyses reward distribution across protected attributes (gender, department, tenure) and surfaces fairness scores and anomalies.
- **(C) Compensation Co-Pilot** — Given a fixed bonus pool, an LLM proposes per-employee splits with written justifications grounded in attendance, KPI, and feedback data.

The product targets two roles — **Employee** and **HR Admin** — and is built on a serverless stack designed to deploy on Vercel within minutes.

---

## 2. Problem Statement

### 2.1 The Real-World Pain

Modern organisations spend 8–12% of payroll on variable compensation (bonuses, incentives, recognition awards). Yet research consistently finds three structural problems:

1. **Manager Bias** — Subjective ratings cluster around demographic lines. Statistically significant gaps in bonus allocation by gender and ethnicity persist even when performance is held constant.
2. **Opaque Decisions** — Employees rarely understand *why* they received the bonus they did. This erodes trust and engagement.
3. **Unfair Recognition** — Spot rewards and "employee of the month" programs are dominated by visibility bias: employees who interact more with managers receive disproportionate recognition.

### 2.2 The Concrete Problem We Solve

> **HR teams need a reward management system that automates point/bonus allocation, surfaces hidden bias, explains every decision, and remains accountable to audit — without requiring a data-science team to operate it.**

### 2.3 Who Suffers Today

| Stakeholder | Pain |
|---|---|
| Employees | No visibility into how rewards are computed; perceived favouritism. |
| Line Managers | Cognitive overload; allocate budgets under time pressure with no decision support. |
| HR Leadership | No tooling to detect or prove fairness; compliance exposure under DPDP / EEOC. |
| Finance | No audit trail linking bonuses to performance evidence. |

### 2.4 Success Criteria

- Decision turnaround for monthly bonus cycle reduced from days to minutes.
- Every reward decision carries a machine-generated, human-readable justification.
- Fairness audit dashboard surfaces disparate-impact ratios in real time.
- Append-only ledger gives a defensible audit trail for every point/bonus event.

---

## 3. Proposed Solution & Approach

### 3.1 Solution Overview

FairReward AI is a Next.js web app where:

- **Employees** clock in, view their points/badges/rank, submit peer kudos, view personal feedback, and redeem rewards.
- **HR Admins** see the full team, run AI-suggested bonus allocations against a budget pool, audit fairness, and approve redemptions.

The system applies **three AI layers** on top of a conventional reward portal:

1. **Sentiment & summarisation** of qualitative feedback (LLM via OpenRouter).
2. **Bonus allocation copilot** — LLM proposes splits with chain-of-evidence justifications.
3. **Bias auditor** — statistical tests in TypeScript surface disparate-impact across protected attributes; LLM converts the numbers to plain English.

### 3.2 Design Principles

| Principle | Implementation |
|---|---|
| **Human-in-the-loop** | LLM never finalises a reward; admin always approves. |
| **Explainability** | Every reward record stores the input features and the LLM rationale. |
| **Append-only audit** | `rewards_ledger` is INSERT-only; corrections create new rows. |
| **Least privilege** | Supabase RLS enforces row-level role separation. |
| **Cache-first reads** | Upstash Redis caches expensive aggregates; invalidated on write. |
| **Edge-friendly** | Next.js Server Components + API routes deploy to Vercel edge/serverless. |

### 3.3 Differentiators

- A **fairness score** is shown next to every reward decision.
- An **append-only ledger** gives every bonus a defensible audit trail.
- **Three-layer AI** (sentiment → suggestion → audit) keeps the LLM out of the critical write path while making the experience feel intelligent.
- Statistical bias auditing (Disparate Impact Ratio, F-test, manager skew) computed deterministically server-side — the LLM only narrates, never decides.

---

## 4. Core Feature Set

### 4.1 Employee Features

| ID | Feature | Description |
|---|---|---|
| E-01 | Auth & Profile | Email/password login via Supabase Auth; profile with avatar, department, role. |
| E-02 | Attendance Check-In | Daily check-in (with optional geofence); streak tracking. |
| E-03 | KPI Dashboard | View KPIs assigned by admin; self-update progress with evidence. |
| E-04 | Points Wallet | Real-time balance, lifetime earned, expiring soon. |
| E-05 | Badges | Unlocked, locked-with-progress, rarity tiers. |
| E-06 | Leaderboard | Department + company-wide; weekly/monthly toggle. |
| E-07 | Peer Kudos | Send recognition to teammates (capped to prevent inflation). |
| E-08 | Feedback Inbox | View 360° feedback received; sentiment-tagged. |
| E-09 | Redemption Store | Spend points on vouchers, extra leave, swag. |
| E-10 | Notifications | Realtime toast + in-app feed when rewards land. |

### 4.2 HR Admin Features

| ID | Feature | Description |
|---|---|---|
| A-01 | User Management | CRUD employees, bulk CSV import, assign departments. |
| A-02 | KPI Builder | Define KPIs per role, weightings, evaluation periods. |
| A-03 | Manual Reward Award | Award points/badges/bonus with reason. |
| A-04 | **AI Bonus Allocator** | Input pool size → AI proposes splits → admin edits → publishes. |
| A-05 | **Bias Audit Dashboard** | Distribution by gender/dept/tenure; fairness score; flagged anomalies. |
| A-06 | Sentiment Overview | Aggregate sentiment of feedback per manager / per employee. |
| A-07 | Anomaly Center | Suspicious attendance jumps near review periods, skewed feedback. |
| A-08 | Redemption Approvals | Approve/reject employee redemptions. |
| A-09 | Configuration | Point values, badge rules, redemption catalog, AI guardrails. |
| A-10 | Audit Log | Append-only ledger view; export CSV. |

---

## 5. Technical Stack

### 5.1 Stack Table

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | RSC, server actions, edge-ready, single deploy. |
| **Language** | TypeScript (strict) | Type safety end-to-end. |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Consistent design tokens, accessible primitives. |
| **Charts** | Recharts + Tremor | Production-grade analytics components. |
| **Auth & DB** | Supabase (Postgres 15, Auth, Realtime, Storage) | RLS, realtime channels, generous free tier. |
| **Caching / Rate Limit** | Upstash Redis (REST) | Edge-compatible; `@upstash/ratelimit` library. |
| **LLM Gateway** | OpenRouter API | Single key → multiple models (Claude Haiku, GPT-4o-mini, Llama 3.1). |
| **Validation** | Zod | Schema validation for forms + API boundaries. |
| **State** | TanStack Query + Zustand | Query for server state, Zustand for UI state only. |
| **Email** | Resend | Transactional notifications (admin invites, weekly summaries). |
| **Observability** | Vercel Analytics + Sentry (free tier) | Errors + perf. |
| **Hosting** | Vercel | Native Next.js, preview deploys per PR. |

### 5.2 Justification for Key Choices

- **Supabase over Firebase** — Postgres + RLS is auditable; Firebase rules are harder to reason about for a fairness story.
- **OpenRouter over direct OpenAI/Anthropic** — One key, model swap without code changes, and cheap models (Haiku, Llama) for non-critical calls.
- **Upstash Redis** — Serverless Redis with REST API works on Vercel edge runtime; pay-per-request fits a lean budget.
- **Tremor** — Production-grade dashboard primitives that match the analytics-heavy nature of the admin surface.

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                          │
│  Next.js RSC pages · Tailwind UI · TanStack Query · Realtime client  │
└────────────────┬───────────────────────────────────┬─────────────────┘
                 │ HTTPS                             │ WSS (Realtime)
                 ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       VERCEL EDGE / SERVERLESS                       │
│  ┌────────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │ Next.js Route      │  │ Server Actions   │  │ Middleware      │   │
│  │ Handlers (/api/*)  │  │ (mutations)      │  │ (auth, rate)    │   │
│  └─────────┬──────────┘  └────────┬─────────┘  └────────┬────────┘   │
└────────────┼─────────────────────┼─────────────────────┼─────────────┘
             │                     │                     │
   ┌─────────┴────────┐   ┌────────┴────────┐    ┌───────┴──────┐
   │  SUPABASE        │   │  UPSTASH REDIS  │    │  OPENROUTER  │
   │  · Postgres      │   │  · Cache        │    │  · LLM calls │
   │  · Auth (JWT)    │   │  · Rate limit   │    │              │
   │  · RLS           │   │  · Idempotency  │    └──────────────┘
   │  · Realtime      │   └─────────────────┘
   │  · Storage       │
   └──────────────────┘
```

### 6.2 Request Lifecycle (mutation example: "Publish Allocation")

1. Admin clicks **Publish Allocation** in `/admin/allocator`.
2. Client sends `POST /api/admin/allocator/publish` with the allocation draft.
3. Middleware verifies Supabase JWT, extracts role from `auth.jwt() -> 'role'`.
4. Upstash rate-limit check (`allocator:{userId}` → 5 req/min).
5. Zod validates payload.
6. Server action opens Supabase transaction:
   - Insert N rows into `rewards_ledger` (append-only).
   - Refresh `points_balance` materialised view.
   - Insert `audit_log` row with admin id + LLM rationale snapshot.
7. Realtime broadcasts on `rewards_ledger` channel.
8. Cache keys `leaderboard:*`, `wallet:{userId}` invalidated in Redis.
9. Resend dispatches emails (queued via Vercel cron / `after()`).
10. Response returns ledger ids + new balances.

### 6.3 Deployment Topology

```
GitHub  →  Vercel Preview (per PR)  →  Vercel Production (main)
                                              │
                                              ├──► Supabase (single project, prod schema)
                                              ├──► Upstash Redis (prod database)
                                              └──► OpenRouter (prod key, spend cap)
```

---

## 7. Data Flow Diagrams (DFD)

### 7.1 DFD — Level 0 (Context Diagram)

```
                      ┌────────────────────┐
                      │   FAIRREWARD AI    │
   ┌──────────┐       │     (System)       │       ┌──────────────┐
   │ Employee ├──────►│                    │◄──────┤   HR Admin   │
   └──────────┘       │                    │       └──────────────┘
                      │                    │
                      │                    │◄─────► Supabase DB
                      │                    │◄─────► Upstash Redis
                      │                    │◄─────► OpenRouter LLM
                      └────────────────────┘
```

### 7.2 DFD — Level 1 (Major Processes)

```
       ┌────────────┐
       │  Employee  │
       └──────┬─────┘
              │ login, check-in, kudos
              ▼
   ┌──────────────────────┐         ┌────────────────┐
   │ 1.0 Auth & Identity  │────────►│  D1: users     │
   └──────────┬───────────┘         └────────────────┘
              │
              ▼
   ┌──────────────────────┐         ┌────────────────┐
   │ 2.0 Attendance & KPI │────────►│  D2: attendance│
   │     Tracking         │────────►│  D3: kpis      │
   └──────────┬───────────┘         └────────────────┘
              │
              ▼
   ┌──────────────────────┐         ┌─────────────────┐
   │ 3.0 Feedback &       │────────►│  D4: feedback   │
   │     Sentiment        │◄────────│  OpenRouter LLM │
   └──────────┬───────────┘         └─────────────────┘
              │
              ▼
   ┌──────────────────────┐         ┌─────────────────────┐
   │ 4.0 Reward Engine    │────────►│  D5: rewards_ledger │
   │  (Manual + AI)       │◄────────│  OpenRouter LLM     │
   └──────────┬───────────┘         └─────────────────────┘
              │
              ▼
   ┌──────────────────────┐         ┌────────────────┐
   │ 5.0 Bias Auditor     │────────►│  D6: audit_log │
   └──────────┬───────────┘         └────────────────┘
              │
              ▼
       ┌──────────────┐
       │  HR Admin    │
       └──────────────┘
```

### 7.3 DFD — Level 2 (AI Bonus Allocator detail)

```
   Admin enters
   pool size & cycle
        │
        ▼
   ┌────────────────────────┐
   │ 4.1 Gather Inputs      │
   │  · Attendance %        │◄── D2 attendance
   │  · KPI completion      │◄── D3 kpis
   │  · Feedback sentiment  │◄── D4 feedback
   └──────────┬─────────────┘
              │ feature vector per employee
              ▼
   ┌────────────────────────┐
   │ 4.2 LLM Allocation     │──────► OpenRouter
   │     Prompt + Schema    │◄────── JSON response
   └──────────┬─────────────┘
              │ proposed split + rationale
              ▼
   ┌────────────────────────┐
   │ 4.3 Admin Review &     │
   │     Edit               │
   └──────────┬─────────────┘
              │ approved allocation
              ▼
   ┌────────────────────────┐
   │ 4.4 Persist Ledger     │──────► D5 rewards_ledger
   │     (append-only)      │──────► D6 audit_log
   └──────────┬─────────────┘
              │
              ▼
   ┌────────────────────────┐
   │ 4.5 Notify Employees   │──────► Resend, Realtime
   └────────────────────────┘
```

---

## 8. Data Model & Database Schema

### 8.1 Entity Relationship (textual)

- `users` (1) ──< `attendance` (N)
- `users` (1) ──< `kpi_assignments` (N) >── (1) `kpis`
- `users` (1) ──< `feedback` (N) — `from_user_id`, `to_user_id`
- `users` (1) ──< `rewards_ledger` (N)
- `users` (1) ──< `redemptions` (N) >── (1) `catalog_items`
- `badges` (1) ──< `user_badges` (N) >── (1) `users`
- `allocation_cycles` (1) ──< `rewards_ledger` (N)

### 8.2 SQL Schema (concise)

```sql
-- profiles complement Supabase auth.users
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('employee','admin')),
  department text,
  gender text,            -- optional, used for bias audit (consented)
  joined_at date not null default current_date,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.attendance (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  source text default 'web'
);

create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  weight numeric not null default 1.0,
  active boolean default true
);

create table public.kpi_assignments (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  cycle text not null,            -- e.g. '2026-Q2'
  target numeric,
  achieved numeric default 0,
  evidence_url text,
  unique (user_id, kpi_id, cycle)
);

create table public.feedback (
  id bigserial primary key,
  from_user_id uuid not null references public.users(id),
  to_user_id uuid not null references public.users(id),
  body text not null,
  sentiment text check (sentiment in ('positive','neutral','constructive','negative')),
  sentiment_score numeric,        -- LLM output, [-1, 1]
  created_at timestamptz default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  rarity text check (rarity in ('bronze','silver','gold','platinum')),
  art_url text,
  rule_json jsonb                 -- declarative unlock rule
);

create table public.user_badges (
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (user_id, badge_id)
);

create table public.allocation_cycles (
  id uuid primary key default gen_random_uuid(),
  label text not null,            -- '2026-05 Bonus'
  pool_amount numeric not null,
  status text not null default 'draft' check (status in ('draft','published','closed')),
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- append-only ledger
create table public.rewards_ledger (
  id bigserial primary key,
  user_id uuid not null references public.users(id),
  cycle_id uuid references public.allocation_cycles(id),
  kind text not null check (kind in ('points','bonus','badge','kudos')),
  amount numeric not null default 0,
  reason text not null,
  source text not null check (source in ('manual','ai_suggested','auto_rule','peer')),
  rationale_json jsonb,           -- LLM features + explanation
  awarded_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost_points int not null,
  stock int default -1,           -- -1 = unlimited
  active boolean default true
);

create table public.redemptions (
  id bigserial primary key,
  user_id uuid not null references public.users(id),
  item_id uuid not null references public.catalog_items(id),
  points_spent int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','fulfilled')),
  decided_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz default now()
);

-- materialised view for hot reads
create materialized view public.points_balance as
select user_id,
       sum(case when kind in ('points','kudos') then amount else 0 end) as balance,
       sum(amount) filter (where kind = 'bonus') as bonus_total
from public.rewards_ledger
group by user_id;

create unique index on public.points_balance (user_id);
```

### 8.3 Indexes

```sql
create index on rewards_ledger (user_id, created_at desc);
create index on rewards_ledger (cycle_id);
create index on attendance (user_id, check_in desc);
create index on feedback (to_user_id, created_at desc);
create index on audit_log (actor_id, created_at desc);
```

---

## 9. Row-Level Security (RLS) Strategy

```sql
alter table public.users enable row level security;
alter table public.rewards_ledger enable row level security;
alter table public.feedback enable row level security;
alter table public.redemptions enable row level security;
alter table public.attendance enable row level security;

-- helper: is_admin()
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- users
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy users_admin_write on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- rewards_ledger
create policy ledger_self_read on public.rewards_ledger
  for select using (user_id = auth.uid() or public.is_admin());
create policy ledger_admin_insert on public.rewards_ledger
  for insert with check (public.is_admin() or source = 'peer');

-- feedback
create policy feedback_visible on public.feedback
  for select using (
    to_user_id = auth.uid() or from_user_id = auth.uid() or public.is_admin()
  );
create policy feedback_insert_own on public.feedback
  for insert with check (from_user_id = auth.uid());

-- redemptions
create policy redemption_self on public.redemptions
  for select using (user_id = auth.uid() or public.is_admin());
create policy redemption_create_self on public.redemptions
  for insert with check (user_id = auth.uid());
create policy redemption_admin_decide on public.redemptions
  for update using (public.is_admin());
```

---

## 10. AI Integration Design

### 10.1 LLM Layers

| Layer | Purpose | Model (default via OpenRouter) | Trigger |
|---|---|---|---|
| L1 — Sentiment | Tag feedback `positive / neutral / constructive / negative` + score `[-1,1]` | `anthropic/claude-haiku-4.5` | On `feedback` insert (trigger → edge function). |
| L2 — Bonus Allocator | Propose per-employee split given pool + features | `anthropic/claude-sonnet-4.6` | Admin clicks "Generate". |
| L3 — Bias Narrator | Convert disparate-impact stats into plain English | `meta-llama/llama-3.1-70b-instruct` | On audit dashboard load (cached). |

### 10.2 Bonus Allocator — Prompt Contract

**System prompt (excerpt):**
> You are a compensation analyst. Given a JSON array of employees with `attendance_pct`, `kpi_score`, `peer_sentiment`, `tenure_months`, and a `pool_amount` in INR, return a JSON object matching the schema. **Do not allocate based on gender, department, or any demographic field.** Justify each allocation in ≤30 words referencing only the four input features.

**Output schema (Zod-validated):**
```ts
const allocationSchema = z.object({
  cycle_label: z.string(),
  total_pool: z.number(),
  allocations: z.array(z.object({
    user_id: z.string().uuid(),
    amount: z.number().min(0),
    rationale: z.string().max(280),
    confidence: z.number().min(0).max(1)
  })),
  pool_residual: z.number()
});
```

**Guardrails:**
- Sum of allocations ≤ `pool_amount` (server re-checks).
- Max single allocation ≤ 25% of pool unless admin overrides.
- Rationale must not contain forbidden tokens (gender, race, age).
- LLM call wrapped in retry-with-backoff; failures degrade to equal-split fallback.

### 10.3 Bias Audit Logic

Three statistics computed deterministically server-side in TypeScript:

1. **Disparate Impact Ratio (DIR)** — `mean_reward(group_A) / mean_reward(group_B)`. Flag if `< 0.8` (4/5ths rule).
2. **Variance ratio across departments** — F-test; flag if p < 0.05.
3. **Manager skew** — std-dev of feedback sentiment per manager; flag outliers > 2σ.

Results written to `audit_findings` table; LLM (L3) generates plain-English summary cached in Redis for 1 hour.

### 10.4 Cost & Spend Controls

- OpenRouter spend cap set in dashboard.
- Sentiment uses Haiku (cheapest model) for high-frequency calls.
- Allocator runs ≤ 1× per cycle per admin (Redis idempotency key).
- All prompts/responses logged to `audit_log` for reproducibility.

---

## 11. Caching, Rate Limiting & Realtime

### 11.1 Upstash Redis Usage

| Key Pattern | Purpose | TTL |
|---|---|---|
| `leaderboard:{scope}:{period}` | Cached top-50 query | 60s |
| `wallet:{user_id}` | Points balance | 30s |
| `audit:summary` | Bias narrator output | 1h |
| `rl:{action}:{user_id}` | Rate limit counter | sliding 60s |
| `idemp:allocator:{cycle_id}` | Idempotency lock | 10min |

### 11.2 Rate Limits (`@upstash/ratelimit`)

| Action | Limit |
|---|---|
| Login attempt | 5 / min / IP |
| Peer kudos | 10 / day / user |
| AI allocator | 3 / hour / admin |
| Feedback submit | 20 / day / user |

### 11.3 Realtime Channels

- `public:rewards_ledger` → wallet/leaderboard live updates.
- `public:redemptions` → admin approval queue badge.
- `public:audit_log` → admin notifications.

---

## 12. API Surface

> Server actions used for mutations from RSC; route handlers expose the same logic for non-RSC callers (mobile-future, CSV imports).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/callback` | public | Supabase auth callback. |
| GET | `/api/me` | user | Current profile + balance. |
| POST | `/api/attendance/check-in` | user | Idempotent per-day. |
| POST | `/api/feedback` | user | Submit kudos/feedback; triggers sentiment. |
| GET | `/api/leaderboard?scope=dept&period=month` | user | Cached leaderboard. |
| POST | `/api/redemptions` | user | Request redemption. |
| POST | `/api/admin/allocator/generate` | admin | LLM proposes allocation. |
| POST | `/api/admin/allocator/publish` | admin | Persists to ledger. |
| GET | `/api/admin/audit/fairness` | admin | Bias metrics + narrator. |
| POST | `/api/admin/users/import` | admin | CSV bulk import. |
| GET | `/api/admin/export/csv?dataset=ledger` | admin | CSV export. |

All mutating endpoints validate with Zod and return RFC 7807 problem details on error.

---

## 13. Project Structure

```
fairreward-ai/
├── README.md
├── blueprint.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .env.local                       # gitignored
├── vercel.json
│
├── public/
│   ├── badges/
│   ├── og.png
│   └── favicon.ico
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_rls.sql
│   │   ├── 0003_views.sql
│   │   └── 0004_seed_meta.sql
│   ├── seed/
│   │   ├── seed.ts                  # tsx seed runner
│   │   └── fixtures.json            # demo employees
│   └── functions/                   # Edge Functions
│       └── on-feedback-insert/
│           └── index.ts             # sentiment hook
│
├── scripts/
│   ├── seed.ts
│   └── export-csv.ts
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                 # marketing landing
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   ├── signup/page.tsx
    │   │   └── callback/route.ts
    │   ├── employee/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx             # dashboard
    │   │   ├── attendance/page.tsx
    │   │   ├── kpis/page.tsx
    │   │   ├── feedback/page.tsx
    │   │   ├── store/page.tsx
    │   │   └── leaderboard/page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx             # ops home
    │   │   ├── users/page.tsx
    │   │   ├── kpis/page.tsx
    │   │   ├── allocator/
    │   │   │   ├── page.tsx
    │   │   │   └── [cycleId]/page.tsx
    │   │   ├── audit/page.tsx       # bias dashboard
    │   │   ├── redemptions/page.tsx
    │   │   ├── catalog/page.tsx
    │   │   └── settings/page.tsx
    │   └── api/
    │       ├── me/route.ts
    │       ├── attendance/check-in/route.ts
    │       ├── feedback/route.ts
    │       ├── leaderboard/route.ts
    │       ├── redemptions/route.ts
    │       └── admin/
    │           ├── allocator/
    │           │   ├── generate/route.ts
    │           │   └── publish/route.ts
    │           ├── audit/fairness/route.ts
    │           ├── users/import/route.ts
    │           └── export/csv/route.ts
    │
    ├── components/
    │   ├── ui/                      # shadcn primitives
    │   ├── charts/
    │   │   ├── PointsTrend.tsx
    │   │   ├── DistributionByGender.tsx
    │   │   └── FairnessGauge.tsx
    │   ├── reward/
    │   │   ├── PointsWallet.tsx
    │   │   ├── BadgeGrid.tsx
    │   │   └── LeaderboardCard.tsx
    │   ├── allocator/
    │   │   ├── PoolInput.tsx
    │   │   ├── SuggestionTable.tsx
    │   │   └── RationaleDrawer.tsx
    │   └── nav/
    │       ├── Sidebar.tsx
    │       └── TopBar.tsx
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts            # server client
    │   │   ├── browser.ts           # browser client
    │   │   └── admin.ts             # service-role
    │   ├── redis.ts                 # Upstash client + ratelimit
    │   ├── llm/
    │   │   ├── client.ts            # OpenRouter wrapper
    │   │   ├── prompts.ts
    │   │   ├── schemas.ts           # Zod
    │   │   └── allocator.ts
    │   ├── audit/
    │   │   ├── disparate-impact.ts
    │   │   └── anomalies.ts
    │   ├── auth.ts
    │   ├── rbac.ts
    │   ├── env.ts                   # zod-validated env
    │   └── utils.ts
    │
    ├── hooks/
    │   ├── useUser.ts
    │   ├── useRealtimeWallet.ts
    │   └── useLeaderboard.ts
    │
    ├── stores/
    │   └── ui.ts                    # zustand
    │
    ├── types/
    │   ├── database.ts              # generated from Supabase
    │   └── domain.ts
    │
    └── styles/
        └── tokens.css
```

---

## 14. UI / UX Design System

### 14.1 Visual Direction

- **Light + dark** themes; auto-detect.
- Type scale: Inter for UI, JetBrains Mono for ledger numbers.
- Colour tokens: `primary` (indigo-600), `success` (emerald-500), `warn` (amber-500), `danger` (rose-500), `muted` neutrals.
- 8-pt spacing grid; 12-col responsive layout.

### 14.2 Key Screens (wireframe-level)

1. **Employee Dashboard** — Points wallet card, current streak, badge progress, recent rewards feed, leaderboard rank.
2. **Admin Allocator** — Step 1 pool input → Step 2 suggestion table with editable amounts, per-row rationale drawer → Step 3 confirm + publish.
3. **Bias Audit** — Top: fairness gauge + plain-English narrator paragraph. Below: distribution charts by gender / department / tenure with flagged rows.
4. **Redemption Store** — Card grid with cost; admin queue shows pending requests with approve/reject.

### 14.3 Accessibility

- All interactive elements WCAG AA.
- shadcn/ui primitives ship accessible defaults.
- Charts have data-table fallbacks via `aria-describedby`.

---

## 15. Security & Privacy

| Concern | Control |
|---|---|
| Auth | Supabase Auth (PKCE), HTTP-only cookies. |
| Session | JWT auto-refresh; server validates on every request. |
| Authorisation | RLS at DB layer + `is_admin()` checks in API. |
| Secrets | Server-only env vars; never exposed to client. |
| PII | Gender field optional + opt-in consent screen; encrypted at rest by Supabase. |
| Audit | Append-only `rewards_ledger` + `audit_log`. |
| Rate limits | Upstash `@upstash/ratelimit` per route. |
| Input validation | Zod at every API boundary. |
| LLM safety | Forbidden-token check; allocations server-clamped. |
| Compliance | DPDP Act 2023 (India) — data minimisation, right to erasure via `users` soft-delete + ledger anonymisation. |

---

## 16. Testing Strategy

| Layer | Tool | Coverage Goal |
|---|---|---|
| Unit (lib/) | Vitest | 80% |
| Component | Vitest + Testing Library | Smoke on key components |
| API routes | Vitest + supertest-style harness | All happy + 1 error path |
| E2E | Playwright | Login → check-in → award → redeem flow |
| Database | pgTAP migrations test | RLS policies behave |
| Load | k6 (optional) | Leaderboard p95 < 200ms |

CI runs lint, typecheck, vitest, and Playwright headless on every PR.

---

## 17. Deployment & DevOps (Vercel)

### 17.1 Environments

| Env | URL | Branch | DB |
|---|---|---|---|
| Preview | `*.vercel.app` (per PR) | feature/* | Supabase preview branch |
| Production | `fairreward.app` | `main` | Supabase prod |

### 17.2 Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENROUTER_API_KEY=
OPENROUTER_DEFAULT_MODEL=anthropic/claude-haiku-4.5
RESEND_API_KEY=
SENTRY_DSN=
APP_URL=https://fairreward.app
```

### 17.3 Vercel Configuration

- Framework preset: Next.js.
- Region: `bom1` (Mumbai) for latency in India.
- Cron: `0 9 * * 1` weekly digest email; `0 0 1 * *` monthly bias audit refresh.
- Edge middleware for auth + rate limit.
- Output cache: revalidate leaderboard tag on ledger writes.

### 17.4 Release Checklist

- [ ] All migrations applied via `supabase db push`.
- [ ] Seed runs idempotent.
- [ ] Sentry DSN active.
- [ ] OpenRouter spend cap set.
- [ ] Smoke E2E green on preview.
- [ ] Lighthouse ≥ 90 (Perf/A11y/Best Practices).
- [ ] Privacy notice + consent screen live.

---

## 18. Phased Build Plan

### Phase 0 — Setup

**Goal:** repos, accounts, scaffold, CI.

- Provision Supabase project, Upstash Redis DB, OpenRouter key, Vercel project, Resend key.
- `pnpm create next-app` with App Router + TS + Tailwind.
- Install deps: `@supabase/ssr`, `@supabase/supabase-js`, `@upstash/redis`, `@upstash/ratelimit`, `zod`, `@tanstack/react-query`, `recharts`, `@tremor/react`, `lucide-react`, shadcn/ui.
- ESLint + Prettier + Husky pre-commit.
- GitHub Actions: lint + typecheck + vitest.
- Wire `.env.example`; deploy empty app to Vercel.

**Exit criteria:** preview URL renders "Hello FairReward".

---

### Phase 1 — Auth & Schema

**Goal:** roles, RLS, login working end-to-end.

- Migrations `0001_init.sql` (tables) + `0002_rls.sql`.
- Generate types: `supabase gen types typescript`.
- Build `/login`, `/signup`, `/auth/callback`.
- Implement `lib/supabase/{server,browser,admin}.ts`.
- Middleware: redirect by role.
- Seed: 1 admin + 5 demo employees.

**Exit criteria:** admin and employee land on different dashboards; RLS verified by attempting cross-row reads.

---

### Phase 2 — Employee Surface

**Goal:** the motivation-side product.

- `/employee` dashboard, wallet, badge grid.
- Attendance check-in (server action + idempotency in Redis).
- KPI list with self-update.
- Peer kudos + feedback form (no AI yet).
- Leaderboard (cached via Redis).
- Realtime wallet hook (`useRealtimeWallet`).

**Exit criteria:** demo employees can earn and view points live.

---

### Phase 3 — Admin Surface & Manual Rewards

**Goal:** admin can run a reward cycle without AI.

- `/admin` shell, sidebar, role gate.
- User management (CRUD + CSV import).
- KPI builder.
- Manual reward award form → writes to `rewards_ledger`.
- Redemption queue with approve/reject.
- Catalog editor.
- Audit log viewer.

**Exit criteria:** full reward lifecycle works without LLM.

---

### Phase 4 — AI Layer

**Goal:** sentiment, allocator, narrator.

- `lib/llm/client.ts` (OpenRouter wrapper with retry, Zod-validated JSON mode).
- Edge function `on-feedback-insert` → tag sentiment.
- `/admin/allocator` flow:
  - Pool input form.
  - Generate API → LLM → suggestion table.
  - Editable amounts; rationale drawer.
  - Publish API → server clamps + writes ledger transactionally.
- `/admin/audit` page:
  - Disparate-impact metric cards.
  - Distribution charts.
  - LLM narrator paragraph (cached 1h).
- Anomaly detector (cron-based weekly).

**Exit criteria:** end-to-end demo of the bonus allocator with rationales; bias dashboard renders with seeded data.

---

### Phase 5 — Polish & Hardening

**Goal:** production readiness.

- Empty states, skeletons, toast feedback.
- Dark mode.
- Confetti on badge unlock.
- Observability: Sentry + Vercel Analytics live.
- Privacy & consent screen.
- README with architecture summary.

**Exit criteria:** all primary flows feel polished; error states handled; observability dashboards green.

---

### Phase 6 — Testing & Deployment

**Goal:** ship confidence.

- Vitest unit + component tests for core libs and components.
- Playwright E2E: signup → check-in → kudos → admin awards → redemption.
- pgTAP migration test for RLS.
- Lighthouse audit; fix to ≥ 90.
- Domain configured (or `*.vercel.app`).
- Final demo seed run.

**Exit criteria:** CI green, Lighthouse ≥ 90, production deploy on `main`.

---

## 19. Risk Register & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM cost spikes | Med | Med | Spend cap, Haiku for L1, idempotency keys. |
| LLM hallucinated allocations | High | High | JSON-mode + Zod, server clamp, admin approval gate. |
| RLS misconfig leaks data | Low | High | pgTAP tests; manual cross-account smoke; service role used only server-side. |
| Sparse data → empty charts | High | Med | Seeded employees + months of synthetic activity. |
| Vercel cold start | Low | Low | Warm-up cron; keep critical handlers on edge runtime. |
| Privacy concern around gender | Med | Med | Opt-in consent, anonymised aggregates only. |

---
