# FairReward AI

Bias-aware AI-assisted reward & compensation system. See `blueprint.md` for the full design and `checkpoint.md` for current build status.

## Quick start

```bash
pnpm install
cp .env.example .env.local        # fill values
pnpm dev
```

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Supabase · Upstash Redis · OpenRouter · Vercel

## Scripts

| Command            | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Local dev server                           |
| `pnpm build`       | Production build                           |
| `pnpm typecheck`   | TS strict typecheck                        |
| `pnpm db:push`     | Apply Supabase migrations to your project  |
| `pnpm db:types`    | Regenerate `src/types/database.ts`         |
| `pnpm seed`        | Seed local Supabase with demo users        |

## Project layout

See `blueprint.md` §13.
