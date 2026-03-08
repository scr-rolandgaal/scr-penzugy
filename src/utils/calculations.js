import { monthLabel } from './formatters';

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
