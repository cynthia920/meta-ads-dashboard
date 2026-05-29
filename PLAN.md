# AI Community Moderation — Build Plan

A dashboard for moderating comments on Facebook Page posts and Instagram Business
accounts, across organic and ad (including dark) posts, in EN / ES / KO / ZH / JA.

## Locked-in product scope

- **Multi-account.** Connect many FB Pages and IG Business accounts. Header
  switcher selects one, several, or all. Per-account settings.
- **Sources.** Organic Page/IG posts **and** ad posts (including dark posts).
  Surface campaign / ad set / ad name for ad comments.
- **Languages.** Auto-detect EN, ES, KO, ZH, JA. Translate non-EN to EN for the
  reviewer's column.
- **Classifier.** Claude assigns one of: `spam`, `toxic`, `negative-genuine`,
  `neutral`, `positive`, with confidence and reason. Reviewer can override the
  language and the classifier inline — overrides are stored as feedback.
- **Moderation action: hide only, never delete.** Recursive: when a parent is
  hidden, every reply under it is individually hidden too so each row has its
  own audit trail and stays hidden if the parent is unhidden later. Fully
  reversible.
- **Inbox table columns.** Account · Post · Source (Organic / Ad + ad name) ·
  Comment · Detected Language · Translation (EN) · Classifier · Status · Actions.
- **Filters per column** (multi-select for enums, text search for free-text,
  date range), **bulk action bar** on row selection, **saved views**.
- **Audit log** for every hide / unhide / reclassification.
- **Token health** monitoring on each connected account (expired tokens are the
  #1 silent failure mode).

## What's explicitly out of v1

- Deleting comments (hide only).
- Auto-replying or "seeding" comments from any account — refused, this would be
  astroturfing and violates Meta policy + consumer law in most markets.
- Non-Meta surfaces (TikTok, YouTube, X).
- Analytics dashboards on sentiment trends (can come later — schema supports it).

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | Next.js 15 (App Router, TypeScript) | One repo, React Server Components for the heavy table, API routes for actions, easy Vercel deploy. |
| DB | Postgres (Neon or Supabase Postgres) | Relational fits the comment graph cleanly; JSON columns for flexible rule storage. |
| ORM | Prisma | Type-safe schema, migrations, good DX. |
| Auth (dashboard users) | NextAuth (Auth.js) | Standard session handling. |
| Meta OAuth | Custom flow stored in `MetaAccount` | NextAuth's FB provider is for *logging in* — we need long-lived Page/IG access tokens, which is a separate flow. |
| Background polling | Vercel Cron → API route | Free tier runs every 5–60 min, enough for v1. Upgrade to a persistent worker (Inngest or Railway) if we need sub-minute latency. |
| Classifier | Claude Sonnet via `@anthropic-ai/sdk` with prompt caching | Cache the system prompt + taxonomy so per-comment cost stays low. Batch 20 comments per call. |
| Hosting | Vercel + Neon | Cheapest start, scales fine for v1. |

## Data model (Prisma)

```
User                  — dashboard login (NextAuth)
  └─ MetaAccount[]    — connected FB Page or IG account, with access token + status
       ├─ AccountSettings (auto-hide rules, language scope, poll interval)
       └─ Post[]      — organic or ad post we've ingested
            └─ Comment[]
                 ├─ detectedLanguage / translationEn
                 ├─ classifier / classifierConfidence / classifierReason
                 ├─ status (VISIBLE / HIDDEN / PENDING_REVIEW)
                 ├─ parentExternalId (for replies)
                 └─ AuditEvent[]   — every hide / unhide / reclassify
SavedView             — per-user saved filter combos
```

Full schema is in `prisma/schema.prisma`.

Key design choices:
- `Comment.externalId` is unique → idempotent re-ingest.
- `Comment.parentExternalId` lets us walk the reply tree without storing FK to
  a row that might not exist yet (parent could be ingested in a later page).
- `MetaAccount.accessToken` will be encrypted at rest before going to prod
  (placeholder column for v1; encryption added in Phase 3).
- `AuditEvent.actor` is either a user id or the literal string `"auto"` so the
  auto-hide path is recorded the same way as a human hide.

## Graph API data flow

```
Cron (every N min)
  └─ for each MetaAccount with ACTIVE token:
       1. fetch new posts
          ├─ FB Page organic: GET /{page-id}/published_posts?since={last_polled}
          ├─ FB Page ads:     GET /{ad-account-id}/ads -> effective_object_story_id
          └─ IG Business:     GET /{ig-user-id}/media (and ad media via the ad path)
       2. for each new/known post, GET /{post-id}/comments?filter=stream
          (filter=stream returns hidden comments too — we want them for state sync)
       3. upsert into Post / Comment
       4. enqueue unclassified comments for the classifier batch job
```

Rate limits: FB's per-app and per-user rate limits are the constraint. Strategy:
- Cap concurrency at 5 requests/sec per app.
- Honor `X-App-Usage` and `X-Ad-Account-Usage` headers; back off at >75%.
- Page through with cursor; persist the cursor in `Post.lastPolledAt` so we
  resume cleanly.

## Classifier loop

- Pull up to 20 unclassified comments at a time.
- Single Claude call with cached system prompt that defines the taxonomy +
  language list + few-shot examples.
- Output: `[{commentId, language, languageConfidence, translationEn,
  classifier, classifierConfidence, reason}]`.
- Write back transactionally. Audit log entry with `actor="auto"`.

## Permissions / scopes we'll need from Meta

- `pages_show_list`, `pages_read_engagement`, `pages_manage_engagement`
- `pages_manage_metadata` (token exchange for long-lived Page tokens)
- `instagram_basic`, `instagram_manage_comments`
- `ads_read`, `ads_management` (to enumerate ads + read ad comments)
- `business_management` (for accessing multiple business assets)

App will need **Advanced Access** review from Meta for most of these. That's a
1–4 week process and worth starting **in parallel** with Phase 1 build, not
after.

## Phased build

### Phase 1 — Foundation (this PR)
- [x] Plan doc (this file)
- [x] Next.js + TS + Prisma scaffold
- [x] DB schema + first migration generated
- [x] `.env.example` listing every secret we'll need
- [x] Empty folder structure that telegraphs the architecture

No working feature yet. Goal: reviewable foundation.

### Phase 2 — Auth + connect accounts
- NextAuth login for dashboard users.
- Meta OAuth flow to connect a FB Page or IG Business account; store
  long-lived Page tokens in `MetaAccount`.
- Accounts page: list connected accounts, token status badge, disconnect.

### Phase 3 — Ingest organic comments + read-only inbox
- Cron route + Graph API client for organic FB Page posts.
- Comment ingest job.
- Inbox table (no classifier, no hide yet) — just shows raw comments with
  account/post columns.
- Token encryption at rest.

### Phase 4 — Classifier + translation
- Claude pipeline (batched, prompt-cached).
- Inbox shows detected language, EN translation, classifier label, confidence.
- Inline editing for language + classifier (writes feedback rows).

### Phase 5 — Moderation actions
- Hide (recursive) + Unhide via Graph API.
- Audit log + Status column.
- Bulk action bar.

### Phase 6 — Ad / dark post comments
- Marketing API integration to enumerate ads → story IDs → comments.
- `Source` column distinguishes Organic vs Ad; ad name surfaced.

### Phase 7 — Polish
- Per-account auto-hide rules.
- Saved filter views.
- Sentiment trend chart (optional).
- Multi-user RBAC if a team is moderating.

## Open questions to revisit before Phase 2

- Will multiple humans moderate from one workspace? (Drives RBAC scope.)
- Where does the Meta App live — your developer account or a new one for this
  tool? Advanced Access review needs the app to exist first.
- Auto-hide thresholds: any category you want auto-hidden at high confidence,
  or do you want a human in the loop on everything for v1?
