# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI Product Mentor — a web app for PMs at fintechs to get regulatory-compliant guidance, generate User Stories with compliance linting, and capture feedback. Built with **Spec-Driven Development**: spec must exist before any implementation.

**Specs are the source of truth.** Before touching any feature, read:
1. `docs/specs/00-foundation/ARCHITECTURE.md`
2. `docs/specs/00-foundation/DATA-MODELS.md`
3. `docs/specs/00-foundation/API-CONTRACTS.md`
4. `docs/specs/[feature]/SPEC.md` + `TESTS.md`

## Commands

```bash
npm run dev       # start Next.js dev server on :3000
npm run build     # production build
npm run lint      # ESLint
npx tsx scripts/test-prompt.ts   # test LLM prompt end-to-end (requires .env.local)
```

To regenerate Supabase TypeScript types after schema changes:
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

To apply migrations:
```bash
npx supabase db reset   # resets local DB and re-runs all migrations
```

## Environment Variables

Copy `.env.example` → `.env.local`. Required keys:
- `GEMINI_API_KEY` — Google Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `LINEAR_API_KEY` + `LINEAR_TEAM_ID`
- Feature flags: `ENABLE_LINT`, `ENABLE_STREAMING`, `LINT_MAX_RED_RISKS`, `LLM_TIMEOUT_MS`

## Architecture

**Monorepo:** Next.js 14 App Router with API Routes as BFF. Single Docker container.

**Key data flow:**
- Client → `POST /api/session/start` → creates Session, calls Gemini, returns welcome message
- Client → `POST /api/chat/message` → SSE stream from Gemini with regulatory context injected
- Client → `POST /api/story/generate` + `POST /api/story/lint` (async, separate calls — linter failure must not block story delivery)
- Client → `POST /api/feedback` → saves vote + reason to Supabase

**LLM layer** (`src/lib/llm/client.ts`): wraps `@google/genai` SDK; all calls go through `withTimeout()` (default 30s). Never call the LLM from the client side — only from API routes.

**Prompts** (`src/lib/prompts/`): separate `.ts` files per feature; never hardcode prompts inside route handlers.

**Playbook** (`src/lib/playbook/`): regulatory rules as `.md` files (e.g., `bcb-rules.md`), loaded via `loader.ts` and injected into LLM context. Updating rules = git commit, not a DB change.

**Database**: Supabase (Postgres) via `@supabase/supabase-js` — no Prisma. Tables: `Session`, `Message`, `UserStory`, `Feedback`. Migrations in `supabase/migrations/` as plain SQL. Types generated via Supabase CLI.

## Conventions

- TypeScript strict mode; `any` is forbidden — if you need it, the spec is incomplete
- Zod schemas in `src/lib/validators/schemas.ts` for all API inputs; see `DATA-MODELS.md` for the canonical schemas
- All API errors follow `{ error: { code: string, message: string } }` — codes defined in `docs/specs/04-shared/ERRORS.md`
- Session auth in Alpha is anonymous (`x-session-id` header); no user auth in MVP
- `no any` and strict types are enforced by the pre-commit hook (husky)
