import { NextResponse } from "next/server";
import { fetchMetaInsights } from "@/lib/meta";
import { fetchAmazonAttribution } from "@/lib/amazon";
import { joinByMapping, loadMappings } from "@/lib/join";

export const dynamic = "force-dynamic";

function defaultDateRange(): { since: string; until: string } {
  const days = Number(process.env.REPORT_LOOKBACK_DAYS ?? 30);
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { since: fmt(since), until: fmt(until) };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const since = url.searchParams.get("since") ?? defaultDateRange().since;
  const until = url.searchParams.get("until") ?? defaultDateRange().until;

  try {
    const mappings = loadMappings();
    const [meta, amazon] = await Promise.all([
      fetchMetaInsights({ since, until }),
      fetchAmazonAttribution({ startDate: since, endDate: until }),
    ]);
    const rows = joinByMapping(meta, amazon, mappings);

    const totals = rows.reduce(
      (acc, r) => {
        acc.spend += r.spend;
        acc.sales += r.sales;
        acc.purchases += r.purchases;
        return acc;
      },
      { spend: 0, sales: 0, purchases: 0 },
    );
    const blendedRoas = totals.spend > 0 ? totals.sales / totals.spend : null;

    return NextResponse.json({
      dateRange: { since, until },
      rows,
      totals: { ...totals, blendedRoas },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
