"use client";

import { useEffect, useState } from "react";
import type { JoinedRow } from "@/lib/types";

type DashboardResponse = {
  dateRange: { since: string; until: string };
  rows: JoinedRow[];
  totals: { spend: number; sales: number; purchases: number; blendedRoas: number | null };
};

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtNum = (n: number) => n.toLocaleString("en-US");
const fmtRoas = (n: number | null) => (n == null ? "—" : `${n.toFixed(2)}x`);

function defaultDates() {
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { since: fmt(since), until: fmt(until) };
}

export default function Page() {
  const [{ since, until }, setRange] = useState(defaultDates());
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?since=${since}&until=${until}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "request failed");
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <h1>Meta × Amazon Attribution</h1>
      <div className="sub">
        Live ROAS view. Spend from Meta Marketing API, sales from Amazon Attribution.
      </div>

      <div className="controls">
        <input
          type="date"
          value={since}
          onChange={(e) => setRange((r) => ({ ...r, since: e.target.value }))}
        />
        <input
          type="date"
          value={until}
          onChange={(e) => setRange((r) => ({ ...r, until: e.target.value }))}
        />
        <button onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {data && (
        <>
          <div className="kpis">
            <div className="kpi">
              <div className="kpi-label">Meta Spend</div>
              <div className="kpi-value">{fmtMoney(data.totals.spend)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Amazon Sales</div>
              <div className="kpi-value">{fmtMoney(data.totals.sales)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Purchases</div>
              <div className="kpi-value">{fmtNum(data.totals.purchases)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Blended ROAS</div>
              <div
                className={
                  "kpi-value " +
                  (data.totals.blendedRoas != null && data.totals.blendedRoas >= 1
                    ? "roas-good"
                    : "roas-bad")
                }
              >
                {fmtRoas(data.totals.blendedRoas)}
              </div>
            </div>
          </div>

          {data.rows.length === 0 ? (
            <div className="empty">
              No mappings configured. Edit <code>config/ad-tag-mapping.json</code> to map Meta
              ad IDs to Amazon Attribution tag IDs.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Spend</th>
                  <th>Impr.</th>
                  <th>Meta Clicks</th>
                  <th>Amz Clicks</th>
                  <th>DPV</th>
                  <th>Purchases</th>
                  <th>Sales</th>
                  <th>CPA</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={`${r.metaAdId}:${r.amazonTagId}`}>
                    <td>{r.label}</td>
                    <td>{fmtMoney(r.spend)}</td>
                    <td>{fmtNum(r.metaImpressions)}</td>
                    <td>{fmtNum(r.metaClicks)}</td>
                    <td>{fmtNum(r.amazonClicks)}</td>
                    <td>{fmtNum(r.detailPageViews)}</td>
                    <td>{fmtNum(r.purchases)}</td>
                    <td>{fmtMoney(r.sales)}</td>
                    <td>{r.cpa == null ? "—" : fmtMoney(r.cpa)}</td>
                    <td className={r.roas != null && r.roas >= 1 ? "roas-good" : "roas-bad"}>
                      {fmtRoas(r.roas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
