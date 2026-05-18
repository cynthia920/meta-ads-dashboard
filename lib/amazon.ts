import type { AmazonAttribution } from "./types";

type AmazonReportRow = {
  publisherId?: string;
  advertiserName?: string;
  campaignId?: string;
  adGroupId?: string;
  creativeId?: string;
  attributionTagId?: string;
  click?: string | number;
  detailPageView?: string | number;
  purchases?: string | number;
  attributedSales14d?: string | number;
};

type AmazonReportResponse = {
  reports?: AmazonReportRow[];
  message?: string;
};

export async function fetchAmazonAttribution(opts: {
  startDate: string;
  endDate: string;
}): Promise<AmazonAttribution[]> {
  const token = process.env.AMAZON_ACCESS_TOKEN;
  const clientId = process.env.AMAZON_CLIENT_ID;
  const profileId = process.env.AMAZON_PROFILE_ID;
  const host = process.env.AMAZON_API_HOST ?? "https://advertising-api.amazon.com";

  if (!token || !clientId || !profileId) {
    throw new Error(
      "AMAZON_ACCESS_TOKEN, AMAZON_CLIENT_ID, and AMAZON_PROFILE_ID must be set",
    );
  }

  const res = await fetch(`${host}/attribution/report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Amazon-Advertising-API-ClientId": clientId,
      "Amazon-Advertising-API-Scope": profileId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reportType: "PERFORMANCE",
      startDate: opts.startDate.replace(/-/g, ""),
      endDate: opts.endDate.replace(/-/g, ""),
      metrics:
        "Click-throughs,attributedDetailPageViewsClicks14d,attributedPurchases14d,attributedSales14d",
      groupBy: "CREATIVE",
    }),
  });

  const body = (await res.json()) as AmazonReportResponse;
  if (!res.ok) {
    throw new Error(`Amazon Attribution error: ${body.message ?? res.statusText}`);
  }

  const rows = body.reports ?? [];
  return rows.map((r) => ({
    tagId: r.attributionTagId ?? r.creativeId ?? "",
    clicks: Number(r.click ?? 0),
    detailPageViews: Number(r.detailPageView ?? 0),
    purchases: Number(r.purchases ?? 0),
    sales: Number(r.attributedSales14d ?? 0),
  }));
}
