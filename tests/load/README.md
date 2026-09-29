# NextUp launch load test

This is a read-only launch gate for the public home page and opportunities feed. Run it against a local build or a dedicated Vercel preview/staging deployment, not production, unless a production test window has been explicitly approved.

```powershell
npm run build
npm run start
$env:BASE_URL = "http://localhost:3000"
$env:LOAD_RPS = "50"
$env:LOAD_DURATION = "2m"
npm run test:load
```

The default profile sends 50 requests/second: approximately 80% feed API requests and 20% home-page requests. It fails when HTTP errors exceed 1%, application checks fail over 1%, feed p95 exceeds 800 ms, or page p95 exceeds 1.5 seconds.

For a staged capacity test, increase `LOAD_RPS` in steps (for example 50, 100, 200, 500) and record Vercel Functions, database, queue, and error metrics for each step. The first failed threshold is the safe launch ceiling until the bottleneck is addressed.
