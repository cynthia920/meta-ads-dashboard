# meta-ads-dashboard

Live dashboard that joins **Meta Ads spend** with **Amazon Attribution sales** to compute ROAS per ad. Both APIs are called on-demand — no ETL, no warehouse.

## How the join works

Amazon doesn't share Meta click IDs and Meta doesn't see Amazon orders, so we bridge them through **Amazon Attribution tags**:

1. In Amazon Attribution, create a unique tag per Meta ad (or ad set).
2. Use the tag's tracking URL as the Meta ad's destination URL.
3. This dashboard pulls Meta spend by `ad_id` and Amazon sales by `tagId`, then joins on a mapping you maintain in `config/ad-tag-mapping.json`.

ROAS = Amazon `attributedSales14d` / Meta `spend`.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in Meta + Amazon credentials
npm run dev
```

Open http://localhost:3000.

## Credentials

**Meta Marketing API** — Business Manager → System Users → generate token with `ads_read` scope. Token + ad account ID go in `.env.local`.

**Amazon Attribution** — Amazon Ads API (Login with Amazon OAuth). You need an access token, client ID, and profile ID. See [Amazon Ads API docs](https://advertising.amazon.com/API/docs/en-us/reference/2/attribution).

## Mapping ads to tags

Edit `config/ad-tag-mapping.json`:

```json
{
  "mappings": [
    { "metaAdId": "120203...", "amazonTagId": "tag_abc123", "label": "Spring Sale Carousel" }
  ]
}
```

Only mapped ads appear in the dashboard. Unmapped Meta ads and unmapped Amazon tags are ignored.

## Files

- `app/page.tsx` — dashboard UI
- `app/api/dashboard/route.ts` — fetches both APIs in parallel and joins them
- `lib/meta.ts` — Meta Marketing API client (insights endpoint)
- `lib/amazon.ts` — Amazon Attribution Reports API client
- `lib/join.ts` — join + ROAS / CPA calculation
- `config/ad-tag-mapping.json` — Meta ad_id ↔ Amazon tag_id mapping

## Limitations of the Live API approach

- Every page load hits both APIs (rate limits apply — Meta in particular).
- No historical caching — if either API is down, the dashboard fails.
- For >100 ads or multi-account views, switch to a nightly ETL into Postgres or BigQuery.
