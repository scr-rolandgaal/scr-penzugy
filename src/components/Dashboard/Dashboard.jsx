import KPICards from './KPICards';
import MonthlyBarChart from './MonthlyBarChart';
import CategoryPieCharts from './CategoryPieCharts';
import CashflowTable from './CashflowTable';
import { getKPIs, getMonthlyData, getCashflowTable, getCategoryBreakdown } from '../../utils/calculations';
import { useMemo } from 'react';

export default function Dashboard({ transactions, forecasts }) {
  const kpis = useMemo(() => getKPIs(transactions), [transactions]);
  const monthlyData = useMemo(() => getMonthlyData(transactions, 2026), [transactions]);
  const cashflowData = useMemo(() => getCashflowTable(transactions, 2026), [transactions]);
  const incomeBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'bevétel'), [transactions]);
  const expenseBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'kiadás'), [transactions]);

  // Prepare forecast data by month for barchart
  const forecastByMonth = useMemo(() => {
    const map = {};
    forecasts
      .filter((f) => f.status === 'Megerősített' || f.status === 'Folyamatban')
      .forEach((fc) => {
        const d = new Date(fc.expectedDate);
        const m = d.getMonth();
        map[m] = (map[m] || 0) + fc.expectedAmount;
      });
    return Object.entries(map).map(([monthIndex, expectedAmount]) => ({
      monthIndex: parseInt(monthIndex),
      expectedAmount,
    }));
  }, [forecasts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      <KPICards kpis={kpis} />
      <MonthlyBarChart data={monthlyData} forecastData={forecastByMonth} />
      <CategoryPieCharts incomeBreakdown={incomeBreakdown} expenseBreakdown={expenseBreakdown} />
      <CashflowTable data={cashflowData} />
    </div>
  );
}
