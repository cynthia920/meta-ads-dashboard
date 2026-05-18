export type MetaInsight = {
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
};

export type AmazonAttribution = {
  tagId: string;
  clicks: number;
  detailPageViews: number;
  purchases: number;
  sales: number;
};

export type AdMapping = {
  metaAdId: string;
  amazonTagId: string;
  label: string;
};

export type JoinedRow = {
  label: string;
  metaAdId: string;
  amazonTagId: string;
  spend: number;
  metaImpressions: number;
  metaClicks: number;
  amazonClicks: number;
  detailPageViews: number;
  purchases: number;
  sales: number;
  roas: number | null;
  cpa: number | null;
};
