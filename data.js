// Mock Meta Ads data. Replace with a real API call (Meta Marketing API) when wiring backend.

const campaigns = [
  { id: 1, name: 'Spring Sale - Lookalike 1%',        status: 'Active',   spend: 4820.55, impressions: 612340, clicks: 9842, conversions: 412 },
  { id: 2, name: 'Retargeting - Cart Abandoners',     status: 'Active',   spend: 2150.10, impressions: 184200, clicks: 6210, conversions: 538 },
  { id: 3, name: 'Brand Awareness - Broad',           status: 'Active',   spend: 3680.00, impressions: 982110, clicks: 5421, conversions: 121 },
  { id: 4, name: 'Product Launch - Interest Stack',   status: 'Paused',   spend: 1290.75, impressions: 152800, clicks: 2890, conversions: 88  },
  { id: 5, name: 'Video Views - Hero Creative',       status: 'Active',   spend: 2980.40, impressions: 712000, clicks: 4180, conversions: 156 },
  { id: 6, name: 'Lead Gen - Newsletter Signup',      status: 'Active',   spend: 1670.20, impressions: 98400,  clicks: 3120, conversions: 412 },
  { id: 7, name: 'Catalog Sales - DPA',               status: 'Active',   spend: 5210.90, impressions: 320100, clicks: 11250, conversions: 902 },
  { id: 8, name: 'Engagement - UGC Test',             status: 'Inactive', spend: 410.55,  impressions: 62000,  clicks: 980,  conversions: 18  },
  { id: 9, name: 'Reels Push - Creator A',            status: 'Active',   spend: 1840.30, impressions: 410200, clicks: 3640, conversions: 142 },
  { id: 10, name: 'Summer Promo - Lookalike 3%',      status: 'Active',   spend: 3120.00, impressions: 288000, clicks: 5980, conversions: 244 }
];

// 30 days of daily metrics, ending today.
function generateTimeseries(days = 30) {
  const today = new Date();
  const rows = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Base trend with weekly seasonality + noise.
    const dayOfWeek = d.getDay();
    const weekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;
    const base = 850 + (days - i) * 6;
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 90;
    const spend = Math.max(200, (base + noise) * weekend);
    const clicks = Math.round(spend * (3.2 + Math.sin(i * 0.5) * 0.6));
    const impressions = Math.round(clicks * (60 + Math.cos(i * 0.4) * 12));
    rows.push({
      date: d.toISOString().slice(0, 10),
      spend: +spend.toFixed(2),
      clicks,
      impressions
    });
  }
  return rows;
}

const timeseries = generateTimeseries(90);

const placements = [
  { name: 'Facebook Feed',   share: 38 },
  { name: 'Instagram Feed',  share: 26 },
  { name: 'Instagram Reels', share: 18 },
  { name: 'Stories',         share: 11 },
  { name: 'Audience Network',share: 7  }
];
