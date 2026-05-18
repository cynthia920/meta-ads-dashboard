import type {
  AdMapping,
  AmazonAttribution,
  JoinedRow,
  MetaInsight,
} from "./types";
import mappingConfig from "../config/ad-tag-mapping.json";

export function loadMappings(): AdMapping[] {
  return (mappingConfig.mappings ?? []) as AdMapping[];
}

export function joinByMapping(
  meta: MetaInsight[],
  amazon: AmazonAttribution[],
  mappings: AdMapping[],
): JoinedRow[] {
  const metaByAdId = new Map(meta.map((m) => [m.adId, m]));
  const amazonByTag = new Map(amazon.map((a) => [a.tagId, a]));

  return mappings.map((m) => {
    const mi = metaByAdId.get(m.metaAdId);
    const ai = amazonByTag.get(m.amazonTagId);
    const spend = mi?.spend ?? 0;
    const sales = ai?.sales ?? 0;
    const purchases = ai?.purchases ?? 0;

    return {
      label: m.label,
      metaAdId: m.metaAdId,
      amazonTagId: m.amazonTagId,
      spend,
      metaImpressions: mi?.impressions ?? 0,
      metaClicks: mi?.clicks ?? 0,
      amazonClicks: ai?.clicks ?? 0,
      detailPageViews: ai?.detailPageViews ?? 0,
      purchases,
      sales,
      roas: spend > 0 ? sales / spend : null,
      cpa: purchases > 0 ? spend / purchases : null,
    };
  });
}
