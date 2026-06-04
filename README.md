# meta-ads-dashboard

A self-contained Meta Ads performance dashboard. No build step — open `index.html` in a browser.

## Features

- KPI cards: spend, impressions, clicks, CTR, CPC (with prior-period comparison)
- Daily performance time series (spend + clicks)
- Spend share by placement (doughnut)
- Sortable, searchable campaign table with status badges
- Date range selector (7 / 30 / 90 days)

## Run

```
open index.html
```

Or serve locally:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Data

`data.js` is **generated** from raw Meta Ads API responses by `scripts/build_data.py`. It exports:

- `meta` — `accountName`, `accountId`, `currency`, `generatedAt`, `dateRange`
- `campaigns` — top campaigns with `spend`, `impressions`, `clicks`, `ctr`, `cpc`
- `timeseries` — daily `spend`/`impressions`/`clicks` for 90 days
- `placements` — spend share by publisher platform

Currently populated with real data for `act_1354817955224233` ("[북미]성분에디터_아마존"), May 2 – May 31, 2026.

## Refreshing data

1. Re-pull from Meta Ads (via the Meta Ads MCP, or the Marketing API directly) and overwrite the three files in `scripts/raw/`:
   - `campaigns.json` — `level=campaign`, last 30d, top N by spend
   - `timeseries.json` — `level=account`, last 90d, `time_increment=1`
   - `placements.json` — `level=account`, last 30d, `breakdowns=[publisher_platform]`
   Keep the same key names as the existing files (`amount_spent`, `impressions`, `clicks`, `ctr`, `cpc`, `date_start`, `publisher_platform`, etc.).
2. Update the constants at the top of `scripts/build_data.py` (`ACCOUNT_NAME`, `GENERATED_AT`, `DATE_RANGE_LABEL`).
3. Run `python3 scripts/build_data.py` to regenerate `data.js`.
