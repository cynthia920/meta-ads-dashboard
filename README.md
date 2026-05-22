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

## Wiring real data

`data.js` exposes `campaigns`, `timeseries`, and `placements`. Replace these with values fetched from the Meta Marketing API (`/{ad-account-id}/insights`) — the rest of the UI requires no changes.
