const fmt = {
  currency: (v) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  number:   (v) => v.toLocaleString('en-US'),
  percent:  (v) => v.toFixed(2) + '%'
};

let activeRange = 30;
let sortKey = 'spend';
let sortDir = 'desc';
let searchTerm = '';
let timeseriesChart = null;
let placementChart = null;

function rangeRows() {
  return timeseries.slice(-activeRange);
}

function previousRangeRows() {
  const end = timeseries.length - activeRange;
  return timeseries.slice(Math.max(0, end - activeRange), end);
}

function sumField(rows, key) {
  return rows.reduce((acc, r) => acc + r[key], 0);
}

function pctChange(current, previous) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function renderKpis() {
  const cur = rangeRows();
  const prev = previousRangeRows();

  const curSpend = sumField(cur, 'spend');
  const curImp = sumField(cur, 'impressions');
  const curClicks = sumField(cur, 'clicks');
  const curCtr = curImp ? (curClicks / curImp) * 100 : 0;
  const curCpc = curClicks ? curSpend / curClicks : 0;

  const prevSpend = sumField(prev, 'spend');
  const prevImp = sumField(prev, 'impressions');
  const prevClicks = sumField(prev, 'clicks');
  const prevCtr = prevImp ? (prevClicks / prevImp) * 100 : 0;
  const prevCpc = prevClicks ? prevSpend / prevClicks : 0;

  const cards = [
    { label: 'Spend',        value: fmt.currency(curSpend), delta: pctChange(curSpend, prevSpend),     positiveIsGood: false },
    { label: 'Impressions',  value: fmt.number(curImp),     delta: pctChange(curImp, prevImp),         positiveIsGood: true  },
    { label: 'Clicks',       value: fmt.number(curClicks),  delta: pctChange(curClicks, prevClicks),   positiveIsGood: true  },
    { label: 'CTR',          value: fmt.percent(curCtr),    delta: pctChange(curCtr, prevCtr),         positiveIsGood: true  },
    { label: 'CPC',          value: fmt.currency(curCpc),   delta: pctChange(curCpc, prevCpc),         positiveIsGood: false }
  ];

  const container = document.getElementById('kpi-cards');
  container.innerHTML = cards.map((c) => {
    const good = c.positiveIsGood ? c.delta >= 0 : c.delta <= 0;
    const arrow = c.delta >= 0 ? '▲' : '▼';
    const cls = good ? 'kpi-trend-up' : 'kpi-trend-down';
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-5">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">${c.label}</p>
        <p class="text-2xl font-semibold mt-2">${c.value}</p>
        <p class="text-xs mt-1 ${cls}">${arrow} ${Math.abs(c.delta).toFixed(1)}% vs prior period</p>
      </div>
    `;
  }).join('');
}

function renderTimeseriesChart() {
  const rows = rangeRows();
  const labels = rows.map(r => r.date.slice(5));
  const spend = rows.map(r => r.spend);
  const clicks = rows.map(r => r.clicks);

  const ctx = document.getElementById('timeseries-chart').getContext('2d');
  if (timeseriesChart) timeseriesChart.destroy();

  timeseriesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Spend',
          data: spend,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y',
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Clicks',
          data: clicks,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          tension: 0.35,
          yAxisID: 'y1',
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        y:  { position: 'left',  ticks: { callback: v => '$' + v }, grid: { color: '#f1f5f9' } },
        y1: { position: 'right', grid: { display: false } },
        x:  { grid: { display: false } }
      }
    }
  });
}

function renderPlacementChart() {
  const ctx = document.getElementById('placement-chart').getContext('2d');
  if (placementChart) placementChart.destroy();

  placementChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: placements.map(p => p.name),
      datasets: [{
        data: placements.map(p => p.share),
        backgroundColor: ['#2563eb', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 } }
        }
      }
    }
  });
}

function statusBadge(status) {
  const styles = {
    'Active':   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'Paused':   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    'Inactive': 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  };
  return `<span class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ''}">${status}</span>`;
}

function renderCampaigns() {
  const rows = campaigns
    .map(c => ({
      ...c,
      ctr: c.impressions ? (c.clicks / c.impressions) * 100 : 0,
      cpc: c.clicks ? c.spend / c.clicks : 0
    }))
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const tbody = document.getElementById('campaign-tbody');
  tbody.innerHTML = rows.map(c => `
    <tr class="hover:bg-slate-50">
      <td class="px-6 py-3 font-medium text-slate-900">${c.name}</td>
      <td class="px-4 py-3">${statusBadge(c.status)}</td>
      <td class="px-4 py-3 text-right tabular-nums">${fmt.currency(c.spend)}</td>
      <td class="px-4 py-3 text-right tabular-nums">${fmt.number(c.impressions)}</td>
      <td class="px-4 py-3 text-right tabular-nums">${fmt.number(c.clicks)}</td>
      <td class="px-4 py-3 text-right tabular-nums">${fmt.percent(c.ctr)}</td>
      <td class="px-6 py-3 text-right tabular-nums">${fmt.currency(c.cpc)}</td>
    </tr>
  `).join('');
}

function renderAll() {
  renderKpis();
  renderTimeseriesChart();
  renderPlacementChart();
  renderCampaigns();
}

document.getElementById('date-range').addEventListener('change', (e) => {
  activeRange = parseInt(e.target.value, 10);
  renderAll();
});

document.getElementById('campaign-search').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderCampaigns();
});

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'desc';
    }
    renderCampaigns();
  });
});

renderAll();
