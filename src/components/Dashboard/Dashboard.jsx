import { useMemo, useState } from 'react';
import KPICards from './KPICards';
import MonthlyBarChart from './MonthlyBarChart';
import CategoryPieCharts from './CategoryPieCharts';
import CashflowTable from './CashflowTable';
import SummaryReportModal from './SummaryReportModal';
import {
  getKPIs,
  getMonthlyData,
  getCashflowTable,
  getCategoryBreakdown,
  getProjectTypeRatio,
  getVATSummary,
  getMonthlyVAT,
} from '../../utils/calculations';
import { formatHUF, monthLabel, monthLabelFull } from '../../utils/formatters';

function GoalCard({ transactions, goals, setGoal }) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentGoal = goals?.[yearMonth] || 0;
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const monthRevenue = useMemo(() => {
    const today = new Date();
    return transactions
      .filter((tx) => {
        const d = new Date(tx.date);
        return tx.type === 'bevétel' && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
      })
      .reduce((s, tx) => s + tx.amount, 0);
  }, [transactions]);

  const pct = currentGoal > 0 ? Math.min(Math.round((monthRevenue / currentGoal) * 100), 200) : 0;
  const barColor = pct >= 100 ? '#22C55E' : pct >= 70 ? '#F59E0B' : '#EF4444';

  function startEdit() {
    setInput(currentGoal ? String(currentGoal) : '');
    setEditing(true);
  }

  function saveGoal() {
    const val = Number(input);
    if (!isNaN(val) && val >= 0) setGoal(yearMonth, val);
    setEditing(false);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Havi bevételi cél — {monthLabelFull(now.getMonth())} {now.getFullYear()}
        </h3>
      </div>

      <div className="flex items-end gap-6">
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Cél</p>
              {editing ? (
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onBlur={saveGoal}
                  onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  autoFocus
                  className="w-36 border border-purple-400 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                  placeholder="pl. 1000000"
                />
              ) : (
                <button
                  onClick={startEdit}
                  className="text-xl font-bold bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--primary)' }}
                  title="Kattints a szerkesztéshez"
                >
                  {currentGoal > 0 ? formatHUF(currentGoal) : (
                    <span className="text-sm font-medium text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-1.5">
                      + Cél beállítása
                    </span>
                  )}
                </button>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Tényleges</p>
              <p className="text-xl font-bold text-green-600">{formatHUF(monthRevenue)}</p>
            </div>
            {currentGoal > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Teljesítés</p>
                <p className="text-xl font-bold" style={{ color: barColor }}>{pct}%</p>
              </div>
            )}
          </div>

          {currentGoal > 0 && (
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ transactions, forecasts, goals, setGoal }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [vatView, setVatView] = useState('quarterly');
  const [showReport, setShowReport] = useState(false);

  const kpis = useMemo(() => getKPIs(transactions), [transactions]);
  const projectTypeRatio = useMemo(() => getProjectTypeRatio(transactions), [transactions]);
  const monthlyData = useMemo(() => getMonthlyData(transactions, year), [transactions, year]);
  const cashflowData = useMemo(() => getCashflowTable(transactions, year), [transactions, year]);
  const incomeBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'bevétel'), [transactions]);
  const expenseBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'kiadás'), [transactions]);
  const vatSummary = useMemo(() => getVATSummary(transactions, year), [transactions, year]);
  const monthlyVAT = useMemo(() => getMonthlyVAT(transactions, year), [transactions, year]);

  const forecastByMonth = useMemo(() => {
    const map = {};
    forecasts
      .filter((f) => f.status === 'Megerősített' || f.status === 'Folyamatban')
      .forEach((fc) => {
        const d = new Date(fc.expectedDate);
        if (d.getFullYear() !== year) return;
        const m = d.getMonth();
        map[m] = (map[m] || 0) + fc.expectedAmount;
      });
    return Object.entries(map).map(([monthIndex, expectedAmount]) => ({
      monthIndex: parseInt(monthIndex),
      expectedAmount,
    }));
  }, [forecasts, year]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Fejléc + Év választó */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Áttekintés</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReport(true)}
            className="text-sm px-4 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            📄 Riport
          </button>
          <div className="flex items-center gap-0 bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-700 text-base font-medium transition-colors"
            >
              ‹
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-gray-700 border-x border-gray-200">
              {year}
            </span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-700 text-base font-medium transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <KPICards kpis={kpis} projectTypeRatio={projectTypeRatio} />

      {/* Havi cél */}
      {goals && setGoal && (
        <GoalCard transactions={transactions} goals={goals} setGoal={setGoal} />
      )}

      <MonthlyBarChart data={monthlyData} forecastData={forecastByMonth} />
      <CategoryPieCharts incomeBreakdown={incomeBreakdown} expenseBreakdown={expenseBreakdown} />

      {/* ÁFA összesítő */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            ÁFA összesítő — {year}
          </h3>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {[['quarterly', 'Negyedéves'], ['monthly', 'Havi']].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setVatView(v)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  vatView === v ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {vatView === 'quarterly' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {vatSummary.map((q) => (
              <div key={q.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(123,92,246,0.07)' }}>
                <p className="text-xs text-gray-400 mb-0.5">{q.label} fizetendő ÁFA</p>
                <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>
                  {formatHUF(q.vatAmount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
            {monthlyVAT.map((m) => (
              <div key={m.month} className="rounded-xl p-2 text-center" style={{ background: 'rgba(123,92,246,0.07)' }}>
                <p className="text-xs text-gray-400 mb-0.5">{monthLabel(m.month)}</p>
                <p className="font-bold text-xs" style={{ color: 'var(--primary)' }}>
                  {m.vatAmount > 0 ? formatHUF(m.vatAmount) : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CashflowTable data={cashflowData} />

      {showReport && (
        <SummaryReportModal
          transactions={transactions}
          forecasts={forecasts}
          year={year}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
