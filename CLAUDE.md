# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build (run this to catch errors before deploy)
npx tsc --noEmit # Type-check only, no build
```

No test runner is configured. Validate changes with `npx tsc --noEmit` and `npm run build`.

## Required environment variables

Copy `.env.example` → `.env.local` before running locally. All variables except `OPENAI_MODEL` are required:

| Variable | Description |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full contents of the Google service account JSON key, as a single line |
| `SHEET_ID` | Spreadsheet ID from the Google Sheets URL |
| `SHEET_RANGE` | Sheet tab + column range, e.g. `Sheet1!A:I` |
| `SHEET_HEADER_ROWS` | Rows to skip (default `1`) |
| `AUTH_PASSWORD` | Login password for the single-user auth |
| `SESSION_SECRET` | Random secret for signing JWT session cookies (`openssl rand -base64 32`) |
| `OPENAI_API_KEY` | OpenAI API key for AI Chat mode on `/log` (get from platform.openai.com) |
| `OPENAI_MODEL` | Optional override, default `gpt-4o` |

## Architecture

### Data flow

Google Sheets is the sole data store — no database. The app uses a Google service account (credentials in `GOOGLE_SERVICE_ACCOUNT_JSON`) to call the Sheets API from server-side API routes. Credentials never reach the browser.

Each row in the sheet is a `WorkoutEntry` — 9 columns matching the format produced by ChatGPT:

```
date | category | exerciseName | repsText | setsText | weightText | effectiveReps | setsIntensity | weightMult
```

Score = `effectiveReps × setsIntensity × weightMult` — computed in [lib/aggregations.ts](lib/aggregations.ts), never stored.

Row identity is by **1-based row index** (the `rowIndex` field). This is used for update/delete operations (`PATCH /api/entries/[rowIndex]`, `DELETE /api/entries/[rowIndex]`). Row indices shift when rows are deleted, so always refetch after a delete.

### Key library files

- [lib/sheets.ts](lib/sheets.ts) — all Google Sheets API calls (`getAllEntries`, `appendEntries`, `updateEntry`, `deleteEntry`). Adjust `DATA_RANGE` or `SHEET_HEADER_ROWS` here if the sheet structure changes.
- [lib/parser.ts](lib/parser.ts) — parses tab-separated text from ChatGPT into `ParsedLine[]`. Used client-side in the `/log` page.
- [lib/aggregations.ts](lib/aggregations.ts) — pure functions over `WorkoutEntry[]`: weekly/monthly grouping, muscle balance radar data, exercise history, heatmap. All chart data flows through here.
- [lib/auth.ts](lib/auth.ts) — JWT helpers using `jose`. Session cookie name: `wt_session`, 30-day expiry.

### Auth

Single-user password auth. [proxy.ts](proxy.ts) (Next.js 16's replacement for `middleware.ts`) guards all routes except `/login` and `/api/auth/login`. The exported function must be named `proxy`, not `middleware`.

### Pages and their data

All dashboard/chart pages are **async server components** that call `getAllEntries()` directly (no client-side fetching). They have `export const dynamic = "force-dynamic"` to prevent caching stale sheet data.

| Page | What it does |
|---|---|
| `/` | Dashboard: 8-week score bar + sets bar, heatmap, recent entries, refresh button |
| `/log` | Two modes: **AI Chat** (type description → `POST /api/parse-workout` → OpenAI → auto-parsed preview) and **Paste** (paste ChatGPT TSV output manually). Both show editable preview → `POST /api/entries`. |
| `/history` | Client-filtered table with date range, category, exercise search; delete per row; refresh button |
| `/charts` | Weekly stacked bar (12/26w toggle), monthly line, muscle radar (30/90d toggle) |
| `/exercise/[name]` | Per-exercise score + weight progression, personal records |

The AI Chat flow: user describes workout in natural language → `/api/parse-workout` calls OpenAI with the exact ChatGPT system prompt embedded in the route → extracts TSV from the code block response → parsed into preview table. The system prompt is defined at the top of [app/api/parse-workout/route.ts](app/api/parse-workout/route.ts) — update it there if the prompt changes.

### Next.js 16 specifics

- Use `proxy.ts` not `middleware.ts`; export function named `proxy`
- `useSearchParams()` requires a `<Suspense>` boundary — see [app/login/page.tsx](app/login/page.tsx) for the pattern
- Recharts `Tooltip` `formatter` prop receives `value: number | undefined, name: string | undefined` — handle both
- Page params are `Promise<{ ... }>` — must be `await`ed: `const { name } = await params`

### Deployment

Netlify via [netlify.toml](netlify.toml) using `@netlify/plugin-nextjs`. Set all six env vars in Netlify's site configuration before deploying.
