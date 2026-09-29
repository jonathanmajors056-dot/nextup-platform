# Opportunity Platform

NextUp is a lightweight opportunity intelligence platform for curated student and community networks. It turns submitted opportunity messages into structured, reviewable listings and presents verified opportunities in a searchable web feed.

## Requirements

- Node.js 22 or newer
- npm
- Required for a public launch: Supabase project for persistent data
- Optional: OpenAI API key for AI-assisted extraction
- Recommended for public launch: Upstash Redis for distributed API rate limiting

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows one-command setup

From PowerShell in the project folder:

```powershell
.\scripts\setup-windows.ps1
.\scripts\start-dev.ps1
```

For a production-mode local run:

```powershell
.\scripts\start-production.ps1
```

If PowerShell blocks local scripts, run `Set-ExecutionPolicy -Scope Process Bypass` in that window only, then retry. The scripts install dependencies, create `.env.local` from the safe example when needed, prepare the local data directory, and start NextUp.

The application supports a fallback pilot mode with source-checked seed records when Supabase environment variables are not configured. This makes it possible to develop and preview the interface without production credentials; refresh or replace the seed records before treating the feed as a live directory.

### Public launch gate

The fallback store is persisted locally in `data/nextup.json`, so the Windows pilot keeps saves, submissions, and review changes across local restarts. It is still not suitable for a public multi-instance launch because each host has its own file. Before publishing the Vercel deployment, create a Supabase project, run `supabase/schema.sql`, apply the files in `supabase/migrations/`, and configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the hosting environment. Keep the source-checked seed records as a local preview fallback only.

For production traffic protection, create an Upstash Redis database through the Vercel Marketplace (or the Upstash console) and configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The app applies distributed sliding-window limits to public reads, saves, submissions, analytics events, admin actions, and AI extraction. If Redis is not configured, local development continues without rate limiting; if Redis temporarily fails, requests fail open and the incident should be investigated from logs.

Submissions are durable in Supabase and are processed through the Vercel Queues topic `nextup-submissions` in production. The queue consumer is configured in `vercel.json`; Vercel authenticates it automatically. For local queue testing, link the project and run `vercel env pull` before using `vercel dev`. Plain `next dev` keeps the fallback/demo flow local. Queue delivery is at-least-once, so the worker claims submissions idempotently and records `queued`, `processing`, `completed`, or `failed` state.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values only on the machine or hosting provider that needs them.

Never commit `.env.local`, API keys, Supabase service-role keys, or other credentials. The `.gitignore` file excludes local secret files.

## Useful commands

```bash
npm run dev
npx tsc --noEmit
npm run build
npm run start
```

## Main routes

- `/` — student opportunity dashboard
- `/saved` — saved opportunities
- `/admin` — review and publishing workflow
- `/api/opportunities` — published opportunity feed
- `/api/submissions` — admin submission intake

## Deployment

The recommended workflow is a private GitHub repository connected to Vercel. Clone the repository on a new laptop, run `npm install`, create `.env.local` from `.env.example`, validate locally, then commit and push changes. Vercel should create preview deployments for branches and deploy the production branch.

Configure environment variables in Vercel separately. Do not copy secrets through Git or a ZIP archive.

Every publish, archive, extraction, and submission lifecycle transition writes to `opportunity_audit_log`. API handlers emit JSON request start/completion/failure events for Vercel Runtime Logs, and the app has route, global, and not-found error boundaries so a single rendering failure does not take down the whole user experience.

After applying the database migration, verify the production checklist: browse the feed while signed out, sign in with the admin account, publish one reviewed opportunity, save it as a normal user, test search and “Load more,” and confirm a second Vercel instance sees the same data. Keep Vercel and Supabase in compatible regions, and configure alerts for function errors, database connection saturation, rate-limit backend failures, and elevated p95 latency before announcing the launch.

### Authentication and first admin

Enable Email or Magic Link authentication in Supabase. Add the first signed-in admin to the database from the Supabase SQL editor after applying the schema:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@example.com'
on conflict (user_id) do update set is_active = true;
```

Use the same email address to sign in at `/login`. The `SUPABASE_SERVICE_ROLE_KEY` is server-only; the browser uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` and database policies enforce access.

## Data and trust model

Opportunities require review before publication. Published listings retain their source and verification state. The application does not scrape personal WhatsApp accounts; future WhatsApp ingestion should use a dedicated official WhatsApp Business integration.
