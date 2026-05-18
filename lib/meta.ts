import type { MetaInsight } from "./types";

type MetaInsightRow = {
  ad_id: string;
  ad_name: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
};

type MetaResponse = {
  data: MetaInsightRow[];
  paging?: { next?: string };
  error?: { message: string; type: string; code: number };
};

export async function fetchMetaInsights(opts: {
  since: string;
  until: string;
}): Promise<MetaInsight[]> {
  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;
  const version = process.env.META_API_VERSION ?? "v21.0";

  if (!token || !accountId) {
    throw new Error("META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be set");
  }

  const params = new URLSearchParams({
    access_token: token,
    level: "ad",
    fields: "ad_id,ad_name,spend,impressions,clicks",
    time_range: JSON.stringify({ since: opts.since, until: opts.until }),
    limit: "500",
  });

  const rows: MetaInsight[] = [];
  let url: string | undefined =
    `https://graph.facebook.com/${version}/${accountId}/insights?${params.toString()}`;

  while (url) {
    const res = await fetch(url);
    const body = (await res.json()) as MetaResponse;
    if (!res.ok || body.error) {
      throw new Error(`Meta API error: ${body.error?.message ?? res.statusText}`);
    }
    for (const r of body.data) {
      rows.push({
        adId: r.ad_id,
        adName: r.ad_name,
        spend: Number(r.spend ?? 0),
        impressions: Number(r.impressions ?? 0),
        clicks: Number(r.clicks ?? 0),
      });
    }
    url = body.paging?.next;
  }

  return rows;
}
