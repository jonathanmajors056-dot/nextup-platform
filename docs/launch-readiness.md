# NextUp launch-readiness audit

Audit date: 2026-09-30  
Source commit: `4b39150`  
Production deployment checked: `nextup-platform-mvehnucf9-al-pha-4-agi-os.vercel.app`

## Verdict

The application passes the local code, browser, API, security, migration, and fallback-capacity checks. It is **not production-ready** because the live Vercel runtime is fail-closed: `/` and `/api/opportunities` return HTTP 503 while the required Supabase/OpenAI configuration is unavailable.

## Evidence that passed

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run test:e2e`: 4 browser journeys passed
- `npm run test:smoke`: 13 API checks passed
- Adversarial matrix: malformed JSON, wrong methods, path traversal, XSS payload, unsafe URLs, oversized input, and cursor injection
- Live security headers: `nosniff`, `DENY`, strict referrer policy, permissions policy, and same-origin opener policy
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities
- Supabase migration/RLS assertions: 15 checks passed

## Capacity evidence

Against the optimized local production server using the fallback store:

| Profile | Result | Feed p95 | Home p95 |
| --- | --- | ---: | ---: |
| 500 requests / concurrency 50 | 500/500, 0% errors | 197 ms | 1.24 s |
| 1,000 requests / concurrency 100 | 1,000/1,000, 0% errors | 333 ms | 2.13 s |

The 50-concurrency profile passes the current thresholds. The 100-concurrency profile exposes a home-render latency breach and should not be treated as a production capacity guarantee; Vercel Functions, Supabase, Redis, and queue metrics must be measured after configuration is fixed.

## Current production blocker

Vercel runtime logs report:

```text
Production configuration is incomplete. Missing:
NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY,
OPENAI_API_KEY
```

The Vercel environment listing currently shows `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ADMIN_REVIEW_KEY`, but the deployed runtime does not receive the four required values. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not listed. Upstash Redis variables are also absent, so distributed rate limiting is not active.

## Final launch gate

After the real values are added to the **Production** environment, redeploy and rerun:

```powershell
npm run check:env
$env:BASE_URL = "https://nextup-platform-gamma.vercel.app"
npm run test:smoke
```

Then verify authenticated Supabase reads/writes, admin review, queued submission processing, Redis 429 behavior, and a staged load profile against a dedicated preview or approved production window.
