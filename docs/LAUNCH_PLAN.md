# NextUp launch plan

This is the operating plan for turning the current opportunity pilot into a useful, shareable student product. The local pilot now carries eight source-checked records across hackathons and scholarships; public launch still requires Supabase persistence, a larger verified directory, and a real student cohort.

Current launch position: the local journey is ready to test, the share loop is instrumented, and every seed record keeps a stable verification date. The next credibility gate is 30 live records with a repeatable review process—not more visual polish.

## Shipped in the local pilot

- Eight source-checked seed records with stable verification timestamps.
- One-click intent lanes for AI building, funding, teams, and beginner-friendly opportunities.
- Shared links that preserve friend context and never expose an empty share URL while the client is loading.
- A persisted application journey on each opportunity: `saved → applying → applied → shortlisted → won/not selected`.

This is enough to test the first retention loop with students. It is not yet proof of retention; that requires real students returning and recording real application outcomes.

## Brutal current rating

| Dimension | Current | 10/10 bar |
| --- | ---: | --- |
| Visual polish | 8/10 | Keep the calm, focused desk feel. Do not add dashboard noise. |
| Student usefulness | 7/10 | The feed is actionable today; matching depth and breadth still need proof. |
| First-visit hook | 7/10 | “Find one opportunity worth your week” is clear; test it against a direct goal prompt. |
| Trust | 5/10 | Eight records are source-checked; scale, freshness, and independent student proof are still missing. |
| Shareability | 6/10 | The recipient gets context, deadline, source, save, and a second share path; conversion is unproven. |
| Repeat use | 6/10 | Application progress creates a return reason; reminders and weekly freshness are not live yet. |
| Paid conversion | 3/10 | The paid outcome is clear on paper, but no willingness-to-pay evidence or billing exists. |
| Launch readiness | 4/10 | Local pilot is testable; public launch still needs production data, credentials, and a student cohort. |

The biggest risk is not the interface. It is credibility at scale. Eight source-checked records are a credible pilot, not yet a directory students can rely on every week; the pilot badge must stay until freshness, coverage, and the review workflow are proven.

## The hook

Primary promise:

> Find one opportunity worth your week.

Supporting promise:

> Tell NextUp what you are building toward. We will help you move before the deadline.

The first screen should answer three questions without scrolling:

1. What is this? A focused feed of worthwhile student opportunities.
2. Why should I care? It removes noisy forwards and deadline anxiety.
3. What do I do now? Open one opportunity, save it, or send it to the right friend.

Do not lead with AI. AI is an internal advantage; the user buys clarity, trust, and momentum.

## The share loop

The shareable unit is one opportunity, not the whole product.

1. A student sees a specific opportunity and taps **Send to a friend**.
2. NextUp creates a public detail link containing the title, deadline, summary, source, and a friend-context message.
3. The recipient lands on the detail page without signing in.
4. The recipient can open the official source or save the opportunity immediately.
5. The recipient sees a clear prompt: **Know someone who should see this?**
6. The opportunity is forwarded again, creating a measurable share → open → save loop.

Why will someone share it?

- It helps a friend avoid missing a deadline.
- It signals usefulness and taste: “I found the one opportunity that fits you.”
- It is low effort: one tap, with the deadline and source already attached.
- It makes the sender look helpful, not promotional.

The share message should stay personal and concrete:

> This looks like you — [opportunity]. Deadline: [date]. I found it on NextUp: [link]

Avoid generic “invite your friends” language until the product has enough value to justify it.

### The 10/10 share plan

The share loop is the growth product. The sender must feel precise, the recipient must get value before signing in, and the second share must feel like helping—not recruiting.

**The share unit:** one opportunity with one clear fit, one deadline, one official source, and one recommended next action.

**The exact recipient journey:**

1. Sender taps **Send to a friend** or **WhatsApp** from a card or detail page.
2. The message says what the opportunity is, why it may fit, and when it closes. It never asks the recipient to “join” first.
3. Recipient lands on the public detail page with the “A friend thought this was worth your week” context.
4. Recipient can open the official source, save, or mark **Applying** without losing the shared context.
5. After the first action, NextUp asks: **Know one teammate who should see this?**
6. A second share keeps the same opportunity context and adds a new referral attribution, so the loop is measurable without making the link feel tracked.

**Why the other person shares:** they can help a specific friend avoid a missed deadline, demonstrate good taste by filtering the noise, and do it in one tap. They will not share a generic productivity brand; they will share a concrete opportunity that makes them look useful.

**Share quality rules:**

- Never share an empty, expired, or unverified link.
- Prefer “This looks like you” over “Invite your friends.”
- Keep the message short enough for WhatsApp preview, but include deadline and source.
- Make the recipient action usable without sign-in; ask for sign-in only when persistence is needed.
- Track `share → shared-link view → official source click/save → second share` before adding incentives.

**Pilot success bar:** at least 15% of opportunity detail views produce a share, 25% of shared-link visits produce an official-source click or save, and 10% of shared-link visits produce a second share. These are directional launch thresholds, not claims about current performance; the pilot must measure them first.

## The 10/10 product plan

1. **Trust gate** — Replace every demo URL with a real official source. Show `officially verified`, `community reviewed`, or `awaiting review`; never blur them together.
2. **Signal onboarding** — Ask for one goal, one skill area, and one format preference. Return three opportunities, not a questionnaire.
3. **One obvious action** — Every card has `Open source`, `Save`, and `Send to a friend`; keep the action hierarchy stable.
4. **Share landing** — Preserve the shared context and make save/open-source usable before sign-in.
5. **Deadline habit** — Add a weekly “closing soon” digest and reminders only for saved opportunities.
6. **Application momentum** — Let a student mark `saved → applying → applied → outcome` and attach a checklist.
7. **Personal relevance** — Explain why a match was shown: skill, eligibility, location, format, or deadline.
8. **Proof loop** — Collect lightweight outcomes: opened source, applied, shortlisted, won, or not a fit.
9. **Campus distribution** — Seed with clubs, placement cells, builders, and student communities; each partner gets a source dashboard and a shareable weekly digest.
10. **Paid upgrade** — Charge for time saved and outcomes improved, not for access to a basic list.

## Recurring customer model

Free should be useful enough to create trust:

- Browse verified opportunities.
- Save a small shortlist.
- Share opportunities.
- See deadlines and source context.

Paid student plan, test at ₹99–₹199/month:

- Personalized matching across chosen goals and skills.
- Saved-opportunity reminders and weekly closing-soon digest.
- Application tracker and reusable checklists.
- Fit explanation and “what to prepare” guidance.
- Unlimited saved items and history.

Paid campus/club plan, test at ₹2,000–₹10,000/month depending on seat and source volume:

- Managed opportunity intake from WhatsApp/email/forms.
- Review queue and verification ownership.
- Private opportunity collections for a cohort.
- Engagement and application outcome reporting.

Do not add billing before the free loop proves demand. The first paid signal is not a click on pricing; it is a student returning for a second week, saving multiple opportunities, or asking for reminders.

### Launch sequence

**Phase 0 — instrumented local pilot (now):** run the app with 8 source-checked records, recruit 10–15 students, and observe the first opportunity opened, source clicked, saved, shared, and progress update. Record every broken source, confusing label, and “I wish it…” request.

**Phase 1 — narrow public beta:** publish only after 30 live opportunities pass the source/deadline review, Supabase persistence is configured, and the share funnel has real denominators. Start with one campus, one builder club, or one student community—not the whole internet.

**Phase 2 — retention proof:** add weekly fresh opportunities and deadline reminders for saved items. Do not expand categories until week-2 return, save rate, and source-click rate are stable for the first cohort.

**Phase 3 — paid test:** show a transparent Pro waitlist to students who have saved 3+ items, returned in week 2, or asked for reminders. Offer ₹99/month founding access to the first cohort; cancel anytime, no dark patterns. If fewer than 5% of qualified users express willingness to pay, improve the free outcome before adding checkout.

**Phase 4 — recurring revenue:** launch billing only after 10 paid or explicitly committed users. The recurring promise is “never miss the right opportunity,” delivered through personal matching, reminders, application checklists, and outcome history—not a larger noisy directory.

## Launch gates

Public launch is ready only when all are true:

- At least 30 real opportunities with working official URLs.
- Every published opportunity has a source, deadline status, and verification timestamp.
- A fresh user can understand the promise and save/share an opportunity in under 60 seconds.
- Shared links work on mobile and preserve title, deadline, and source context.
- `view → open source → save → share` events are visible in analytics.
- Ten students have completed at least one real application using the product.
- No critical runtime errors, broken source links, or fake verification claims.

## Weekly scoreboard

Track these first:

- Activation: percentage of new visitors who open an opportunity within 60 seconds.
- Save rate: saves per opportunity detail view.
- Share rate: shares per detail view.
- Recipient conversion: shared-link visits that save or open the official source.
- Source-click rate: official-source clicks per opportunity detail view.
- Week-2 return rate.
- Verified-source coverage.
- Applications started and completed.

The north-star behavior is: **a student finds a relevant opportunity, takes the next step, and brings one useful opportunity to another student.**
