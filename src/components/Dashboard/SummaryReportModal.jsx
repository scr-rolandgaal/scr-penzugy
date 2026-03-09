import { useMemo } from 'react';
import { getKPIs, getClientSummary, getVATSummary } from '../../utils/calculations';
import { formatHUF, formatDate } from '../../utils/formatters';

export default function SummaryReportModal({ transactions, forecasts, year, onClose }) {
  const yearTx = useMemo(
    () => transactions.filter((tx) => new Date(tx.date).getFullYear() === year),
    [transactions, year]
  );

  const kpis = useMemo(() => getKPIs(yearTx), [yearTx]);
  const clients = useMemo(() => getClientSummary(yearTx, forecasts), [yearTx, forecasts]);
  const vatSummary = useMemo(() => getVATSummary(transactions, year), [transactions, year]);

  const top5 = [...clients].filter((c) => c.isExisting).slice(0, 5);
  const unpaid = yearTx.filter((tx) => tx.type === 'bevétel' && tx.status === 'kifizetetlen');
  const plannedExpenses = forecasts.filter((f) => f.forecastType === 'kiadás');

  function generateHtml() {
    const kpiHtml = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        <div style="background:#f0fdf4;border-radius:8px;padding:12px;text-align:center">
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;margin-bottom:4px">Összes bevétel</div>
          <div style="color:#15803d;font-weight:700;font-size:16px">${formatHUF(kpis.income)}</div>
        </div>
        <div style="background:#fef2f2;border-radius:8px;padding:12px;text-align:center">
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;margin-bottom:4px">Összes kiadás</div>
          <div style="color:#dc2626;font-weight:700;font-size:16px">${formatHUF(kpis.expense)}</div>
        </div>
        <div style="background:#eff6ff;border-radius:8px;padding:12px;text-align:center">
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;margin-bottom:4px">Egyenleg</div>
          <div style="color:${kpis.balance >= 0 ? '#1d4ed8' : '#dc2626'};font-weight:700;font-size:16px">${formatHUF(kpis.balance)}</div>
        </div>
        <div style="background:#fffbeb;border-radius:8px;padding:12px;text-align:center">
          <div style="color:#6b7280;font-size:11px;text-transform:uppercase;margin-bottom:4px">Kifizetetlen</div>
          <div style="color:#d97706;font-weight:700;font-size:16px">${formatHUF(kpis.unpaid)}</div>
        </div>
      </div>`;

    const clientRows = top5.map((c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#15803d;font-weight:600">${formatHUF(c.totalRevenue)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#15803d">${formatHUF(c.paid)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:${c.unpaid > 0 ? '#d97706' : '#9ca3af'}">${formatHUF(c.unpaid)}</td>
      </tr>`).join('');

    const unpaidRows = unpaid.map((tx) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${formatDate(tx.date)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${tx.partner || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${tx.category}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#d97706;font-weight:600">${formatHUF(tx.amount)}</td>
      </tr>`).join('');

    const vatRows = vatSummary.map((q) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600">${q.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#7c3aed;font-weight:600">${formatHUF(q.vatAmount)}</td>
      </tr>`).join('');

    const expenseRows = plannedExpenses.map((fc) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${fc.clientName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${fc.projectType}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-weight:600">${formatHUF(fc.expectedAmount)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${fc.forClient || '—'}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pénzügyi összefoglaló — ${year}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 15px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 12px; }
    .generated { color: #9ca3af; font-size: 12px; margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; color: #9ca3af; text-transform: uppercase; border-bottom: 2px solid #f3f4f6; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Pénzügyi összefoglaló — ${year}</h1>
  <p class="generated">Generálva: ${new Date().toLocaleDateString('hu-HU')}</p>

  <h2>KPI összesítő</h2>
  ${kpiHtml}

  <h2>Top 5 ügyfél — Bevétel</h2>
  <table>
    <thead><tr><th>Ügyfél</th><th>Összes bevétel</th><th>Fizetve</th><th>Kifizetetlen</th></tr></thead>
    <tbody>${clientRows || '<tr><td colspan="4" style="padding:12px;color:#9ca3af;text-align:center">Nincs adat</td></tr>'}</tbody>
  </table>

  <h2>Kifizetetlen számlák (${unpaid.length} db)</h2>
  <table>
    <thead><tr><th>Dátum</th><th>Partner</th><th>Kategória</th><th>Összeg</th></tr></thead>
    <tbody>${unpaidRows || '<tr><td colspan="4" style="padding:12px;color:#9ca3af;text-align:center">Nincsenek kifizetetlen számlák</td></tr>'}</tbody>
  </table>

  <h2>ÁFA összesítő — ${year}</h2>
  <table>
    <thead><tr><th>Negyedév</th><th>Fizetendő ÁFA</th></tr></thead>
    <tbody>${vatRows}</tbody>
  </table>

  <h2>Tervezett kiadások (${plannedExpenses.length} db)</h2>
  <table>
    <thead><tr><th>Partner / Szállító</th><th>Kategória</th><th>Összeg</th><th>Ügyfél</th></tr></thead>
    <tbody>${expenseRows || '<tr><td colspan="4" style="padding:12px;color:#9ca3af;text-align:center">Nincs tervezett kiadás</td></tr>'}</tbody>
  </table>
</body>
</html>`;
  }

  function handleDownload() {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penzigy-osszefoglalo-${year}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    const html = generateHtml();
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 760, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Összefoglaló riport — {year}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none cursor-pointer">×</button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Bevétel', val: kpis.income, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Kiadás', val: kpis.expense, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Egyenleg', val: kpis.balance, color: kpis.balance >= 0 ? 'text-blue-700' : 'text-red-600', bg: 'bg-blue-50' },
            { label: 'Kifizetetlen', val: kpis.unpaid, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className={`font-bold text-sm ${color}`}>{formatHUF(val)}</p>
            </div>
          ))}
        </div>

        {/* Top 5 ügyfelek */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Top 5 ügyfél</h3>
        <div className="card p-0 overflow-x-auto mb-4">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['Ügyfél', 'Bevétel', 'Fizetve', 'Kifizetetlen'].map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-gray-400 font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top5.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Nincs adat</td></tr>
              ) : top5.map((c) => (
                <tr key={c.name} className="border-t border-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-700">{c.name}</td>
                  <td className="py-2 px-3 font-semibold text-green-700">{formatHUF(c.totalRevenue)}</td>
                  <td className="py-2 px-3 text-green-600">{formatHUF(c.paid)}</td>
                  <td className={`py-2 px-3 ${c.unpaid > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>{formatHUF(c.unpaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kifizetetlen számlák */}
        {unpaid.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Kifizetetlen számlák ({unpaid.length} db)
            </h3>
            <div className="card p-0 overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {['Dátum', 'Partner', 'Kategória', 'Összeg'].map((h) => (
                      <th key={h} className="py-2 px-3 text-left text-gray-400 font-semibold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unpaid.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-50">
                      <td className="py-2 px-3 text-gray-500">{formatDate(tx.date)}</td>
                      <td className="py-2 px-3 text-gray-700">{tx.partner || '—'}</td>
                      <td className="py-2 px-3 text-gray-500">{tx.category}</td>
                      <td className="py-2 px-3 font-semibold text-amber-600">{formatHUF(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ÁFA */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">ÁFA összesítő</h3>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {vatSummary.map((q) => (
            <div key={q.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(123,92,246,0.07)' }}>
              <p className="text-xs text-gray-400 mb-0.5">{q.label}</p>
              <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{formatHUF(q.vatAmount)}</p>
            </div>
          ))}
        </div>

        {/* Gombok */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50"
          >
            ↓ HTML letöltés
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            🖨 Nyomtatás / PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
