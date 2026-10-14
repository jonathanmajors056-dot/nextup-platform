# SciLoop → NextUp platform workflow

## Product direction

Build a student opportunity platform that keeps NextUp's verified-opportunity jobs-to-be-done while adopting SciLoop's cinematic, portal-based interface. The product should feel like a scientific mission control surface: every opportunity has a source, deadline, eligibility signal, and a clear next action.

## Reference mapping

| NextUp capability | SciLoop treatment | First release surface |
| --- | --- | --- |
| Discover opportunity stream | Knowledge Frontier / Live Innovations portal | `/` and `#discover` |
| Saved shortlist | Research profile memory / personal collection | `/saved` |
| Admin submission | Feedback Portal / contribution intake | `/admin` |
| Account | Research profile / exploration state | `/auth` |
| NewsPortal | Live Innovations feed with source traceability | `/newsportal` |
| Deadline radar | Mission timeline with urgency states | Overview + Discover |
| City and radius filters | Local Problem Solver lens | Overview + Discover |
| Category/format filters | Portal filters and world tags | Discover |

## Delivery workflow

### Phase 0 — preserve and inventory

1. Keep the Sciloop source intact as the visual and domain reference.
2. Treat NextUp as the interaction contract: routes, labels, states, and trust cues.
3. Start this new platform in the `NEXTUP` workspace so it can evolve without destabilizing Sciloop.

### Phase 1 — shell and visual system

1. Establish SciLoop tokens: near-black space, blue-violet energy, cyan signal, warm deadline amber, glass panels, thin orbit lines, and readable contrast.
2. Build a persistent portal switcher and responsive command navigation.
3. Add shared UI primitives for signal cards, status chips, filters, timeline entries, and empty states.

### Phase 2 — opportunity loop

1. Overview: today’s signal, closing-soon radar, category pulse, location lens, and spotlight.
2. Discover: search, category, format, location, and deadline filters.
3. Opportunity detail: source, eligibility, deadline, organizer, and action path.
4. Save/unsave locally first; later connect persistence and identity.

### Phase 3 — contribution loop

1. Admin submission form with review-state messaging.
2. NewsPortal for source-backed science, innovation, and student signals.
3. Account/profile state for saved work, viewed portals, and contribution history.

### Phase 4 — platform hardening

1. Replace mock data with the existing Sciloop/NextUp APIs and persistence layer.
2. Add authentication and role-based admin review.
3. Validate mobile layouts, keyboard navigation, reduced motion, and source/deadline trust cues.
4. Run build, typecheck, and browser smoke tests before deployment.

## First implementation slice

The first build implements Phases 1–3 as a polished, data-backed front-end prototype with deterministic local state. It includes the overview dashboard, discover filters, saved view, admin submission form, account view, and NewsPortal route, using SciLoop's portal visual language and NextUp's information architecture.

## Current implementation status

The initial shell is now backed by `data/opportunities.ts`, exposed through `GET /api/opportunities`, and routed through static opportunity detail pages at `/discover/[id]`. Shortlist state persists under the browser key `nextup:saved`. This is the first integration seam: the UI can now consume a normalized opportunity contract while the next step replaces the local adapter with the existing Sciloop/NextUp source and review APIs.

The live connection seam is now configurable through `SCILOOP_BASE_URL` (set on the Vercel Preview environment for `codex/sciloop-nextup-preview`): `/api/sciloop/status` checks the running Sciloop `/api/system-status` endpoint, while `/api/sciloop/innovations` reads the remote `/api/sciloop-ai-proxy/news` contract and normalizes it into student-facing signals, falling back to curated local records when unavailable. NewsPortal consumes that normalized route and labels the active source. Student opportunity submissions queue through `/api/opportunities/submissions` and return an explicit review state.

## Self-improving learning loop

The platform now has a local-first adaptive recommendation loop. Opportunity opens, saves, unsaves, and future usefulness feedback become bounded learning events in `nextup:learning-events`; `lib/learning-engine.ts` derives recency-weighted category, format, tag, and item-level signals, then re-ranks the discovery stream with controlled exploration for unseen opportunities. Negative feedback de-prioritizes the specific signal, while mixed feedback automatically increases exploration to recover from a narrow or stale profile. The engine also produces a concrete next move from the current profile, so the student can act on the learning state rather than only read a score. Explanations disclose whether a recommendation was reinforced or de-prioritized by recent feedback. The overview exposes confidence, signal count, feedback quality, next move, and a plain-language explanation so students can see why the system is adapting. `POST /api/learning/profile` accepts the same normalized event batch and returns the derived profile, leaving a clean seam for durable identity/storage and model-assisted summaries later.

The persistence seam is now active when the deployed environment has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: events are written to `student_learning_events` under a stable HttpOnly `nextup-viewer` workspace cookie, then reloaded into the local ranking profile. The API normalizes event payloads and deduplicates by signal identity before writing; the SQL migration also adds a viewer-scoped unique event key, so hydration retries and concurrent requests cannot inflate a student's profile. `GET /api/learning/status` reports whether the configured table is readable, distinguishing shared profile memory from cookie fallback. Without those variables or the migration, the same contract safely falls back to local-first learning. Apply `supabase/learning.sql` to enable durable storage.

## Data contract for the integration step

Each opportunity should eventually resolve to:

```ts
type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  format: "online" | "offline" | "hybrid";
  location: string;
  deadline: string;
  deadlineLabel: string;
  description: string;
  eligibility: string;
  sourceUrl: string;
  verified: boolean;
  tags: string[];
};
```

The visual layer should not invent trust signals: verification, source, and deadline states must come from the data layer once the backend is connected.
