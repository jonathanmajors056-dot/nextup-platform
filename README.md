# Opportunity Platform

NextUp is a lightweight opportunity intelligence platform for curated student and community networks. It turns submitted opportunity messages into structured, reviewable listings and presents verified opportunities in a searchable web feed.

## Requirements

- Node.js 22 or newer
- npm
- Optional: Supabase project for persistent data and authentication
- Optional: OpenAI API key for AI-assisted extraction

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application supports a fallback demo mode when Supabase environment variables are not configured. This makes it possible to develop and preview the interface without production credentials.

When a visitor saves an opportunity, the server assigns a random browser-scoped workspace id in an `HttpOnly` cookie (the id is never accepted from the request body). With Supabase configured, saves are persisted in `saved_opportunities`; without it, they remain in the in-memory demo store. This anonymous identity is the migration path for adding Supabase Auth without changing the opportunity workflow.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values only on the machine or hosting provider that needs them.

Never commit `.env.local`, API keys, Supabase service-role keys, or other credentials. The `.gitignore` file excludes local secret files.

In development, admin endpoints remain available for the demo workflow. In production they fail closed unless `ADMIN_REVIEW_KEY` is configured; scheduled expiry uses `CRON_SECRET` when present.

## Useful commands

```bash
npm run dev
npx tsc --noEmit
npm run build
npm run start
npm run verify:local
```

`npm run verify:local` expects the local dev server or production server to be running and checks the main pages plus the feed, provider, location, expiry, and map-fallback APIs. It requires no credentials.

## Main routes

- `/` — student opportunity dashboard
- `/saved` — saved opportunities
- `/admin` — review and publishing workflow
- `/api/opportunities` — published opportunity feed
- `/api/submissions` — admin submission intake
- `/api/admin/providers` — configured provider registry and source health snapshot
- `/api/admin/ingest` — admin-only normalized ingestion endpoint; creates reviewable drafts and rejects duplicates
- `/api/admin/sync` — admin-only sync of configured, approved RSS feeds with caching and rate-safe fetch behavior
- `/api/admin/expire` — scheduled/admin expiry pass that archives past-deadline drafts and listings

## Current persistence boundary

- Published opportunity reads and admin writes run server-side.
- Saves are associated with the browser's generated workspace id, not a hardcoded shared student id.
- Full email/OAuth sign-in is intentionally the next authentication milestone; do not treat the anonymous workspace id as an account identity.

## Ingestion foundation

Provider adapters are represented in `lib/providers.ts` and normalized candidates flow through `lib/ingestion.ts`. Every ingested record starts as `awaiting_review`; the ingestion endpoint never publishes directly. The Supabase migration adds `opportunity_sources` and `opportunity_source_items` for provider health and durable source lineage. Only approved feeds and APIs should be configured; do not bypass robots.txt, access controls, or provider terms.

`OPPORTUNITY_RSS_URLS` and `OPPORTUNITY_API_URLS` are comma-separated allowlists. RSS and normalized JSON API sources are fetched at most once per five-minute cache window, limited to 2 MB and 100 candidates, and recorded in source health. Do not depend on Eventbrite's retired public event-search endpoint; Eventbrite support should use an organizer-authorized integration only.

Vercel runs the expiry endpoint daily through `vercel.json`. Configure `CRON_SECRET` in hosting so scheduled requests are authenticated; `ADMIN_REVIEW_KEY` remains the local/manual fallback.

Apply `supabase/schema.sql` to the project before enabling persistence. The schema includes idempotent upgrade statements for latitude/longitude and location radius columns, so it can be safely rerun against the existing pilot database.

## Deployment

The recommended workflow is a private GitHub repository connected to Vercel. Clone the repository on a new laptop, run `npm install`, create `.env.local` from `.env.example`, validate locally, then commit and push changes. Vercel should create preview deployments for branches and deploy the production branch.

Configure environment variables in Vercel separately. Do not copy secrets through Git or a ZIP archive.

## Data and trust model

Opportunities require review before publication. Published listings retain their source and verification state. The application does not scrape personal WhatsApp accounts; future WhatsApp ingestion should use a dedicated official WhatsApp Business integration.
