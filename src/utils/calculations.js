import { monthLabel } from './formatters';

export function getMonthlyVAT(transactions, year = 2026) {
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i, vatAmount: 0 }));
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d.getFullYear() !== year || tx.type !== 'bevétel') return;
    months[d.getMonth()].vatAmount += tx.amount - (tx.netAmount || 0);
  });
  return months;
}

export function getKnownPartners(transactions, forecasts = []) {
  const set = new Set();
  transactions.filter((tx) => tx.partner && tx.partner !== '—').forEach((tx) => set.add(tx.partner));
  forecasts.filter((fc) => fc.forecastType !== 'kiadás').forEach((fc) => fc.clientName && set.add(fc.clientName));
  return [...set].sort();
}

export function getMonthlyData(transactions, year = 2026) {
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: monthLabel(i),
    monthIndex: i,
    bevétel: 0,
    kiadás: 0,
  }));

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    if (tx.type === 'bevétel') monthly[m].bevétel += tx.amount;
    else monthly[m].kiadás += tx.amount;
  });

  return monthly;
}

export function getCashflowTable(transactions, year = 2026) {
  const monthly = getMonthlyData(transactions, year);
  let cumulative = 0;
  return monthly.map((m) => {
    const cashflow = m.bevétel - m.kiadás;
    cumulative += cashflow;
    return { ...m, cashflow, cumulative };
  });
}

export function getKPIs(transactions) {
  let income = 0, expense = 0, unpaid = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'bevétel') {
      income += tx.amount;
      if (tx.status === 'kifizetetlen') unpaid += tx.amount;
    } else {
      expense += tx.amount;
    }
  });
  return { income, expense, balance: income - expense, unpaid };
}

export function getCategoryBreakdown(transactions, type) {
  const map = {};
  transactions
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function filterByPeriod(transactions, period) {
  if (!period || period === 'all') return transactions;
  const now = new Date();
  return transactions.filter((tx) => {
    const d = new Date(tx.date);
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
    }
    if (period === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  });
}

export function getClientSummary(transactions, forecasts = [], period = 'all') {
  const filteredTx = filterByPeriod(transactions, period);
  const map = {};

  filteredTx
    .filter((tx) => tx.type === 'bevétel' && tx.partner && tx.partner !== '—')
    .forEach((tx) => {
      const name = tx.partner;
      if (!map[name]) {
        map[name] = { name, totalRevenue: 0, paid: 0, unpaid: 0, lastActivity: null, pipelineStatus: null, projectType: null, allocatedCosts: 0, wonRevenue: 0 };
      }
      map[name].totalRevenue += tx.amount;
      if (tx.status === 'fizetve') map[name].paid += tx.amount;
      else map[name].unpaid += tx.amount;
      if (!map[name].lastActivity || tx.date > map[name].lastActivity) map[name].lastActivity = tx.date;
      if (tx.projectType) map[name].projectType = tx.projectType;
    });

  // Prospects/won deals from bevétel forecasts
  forecasts
    .filter((fc) => (fc.forecastType || 'bevétel') === 'bevétel')
    .forEach((fc) => {
      const name = fc.clientName || fc.client_name;
      if (!name) return;
      if (!map[name]) {
        map[name] = { name, totalRevenue: 0, paid: 0, unpaid: 0, lastActivity: null, pipelineStatus: null, projectType: null, allocatedCosts: 0, wonRevenue: 0 };
      }
      if (fc.status === 'Sikeres üzlet') {
        map[name].wonRevenue = (map[name].wonRevenue || 0) + fc.expectedAmount;
      } else {
        map[name].pipelineStatus = fc.status;
      }
      if (!map[name].lastActivity || (fc.expectedDate && fc.expectedDate > map[name].lastActivity)) {
        map[name].lastActivity = fc.expectedDate;
      }
      if (!map[name].projectType && fc.projectType) map[name].projectType = fc.projectType;
    });

  // Allocate costs from kiadás forecasts with forClient
  forecasts
    .filter((fc) => fc.forecastType === 'kiadás' && fc.forClient)
    .forEach((fc) => {
      const name = fc.forClient;
      if (!map[name]) {
        map[name] = { name, totalRevenue: 0, paid: 0, unpaid: 0, lastActivity: null, pipelineStatus: null, projectType: null, allocatedCosts: 0, wonRevenue: 0 };
      }
      map[name].allocatedCosts = (map[name].allocatedCosts || 0) + fc.expectedAmount;
    });

  const clients = Object.values(map).map((c) => ({
    ...c,
    isExisting: c.totalRevenue > 0 || (c.wonRevenue || 0) > 0,
    profit: c.totalRevenue - (c.allocatedCosts || 0),
  }));

  return clients.sort((a, b) => {
    if (a.isExisting !== b.isExisting) return a.isExisting ? -1 : 1;
    return b.totalRevenue - a.totalRevenue;
  });
}

export function getProjectTypeRatio(transactions) {
  let havi = 0, egyszeri = 0;
  transactions
    .filter((tx) => tx.type === 'bevétel' && tx.projectType)
    .forEach((tx) => {
      if (tx.projectType === 'havi') havi += tx.amount;
      else if (tx.projectType === 'egyszeri') egyszeri += tx.amount;
    });
  const total = havi + egyszeri;
  return {
    havi,
    egyszeri,
    haviPct: total > 0 ? Math.round((havi / total) * 100) : 0,
    egyszeriPct: total > 0 ? Math.round((egyszeri / total) * 100) : 0,
    total,
  };
}

export function getVATSummary(transactions, year = 2026) {
  const quarters = [
    { label: 'Q1', months: [0, 1, 2] },
    { label: 'Q2', months: [3, 4, 5] },
    { label: 'Q3', months: [6, 7, 8] },
    { label: 'Q4', months: [9, 10, 11] },
  ];

  return quarters.map((q) => {
    let vatAmount = 0;
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear() !== year) return;
      if (!q.months.includes(d.getMonth())) return;
      if (tx.type !== 'bevétel') return;
      vatAmount += tx.amount - (tx.netAmount || 0);
    });
    return { label: q.label, vatAmount };
  });
}
