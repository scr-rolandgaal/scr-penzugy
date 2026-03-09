import { formatHUF } from '../../utils/formatters';

export default function ReportModal({ clients, period, onClose }) {
  const periodLabels = {
    all: 'Összes idő',
    year: 'Ez az év',
    quarter: 'Ez a negyedév',
    month: 'Ez a hónap',
  };

  function generateHtml() {
    const rows = clients.map((c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#15803d;font-weight:600">${formatHUF(c.totalRevenue)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#15803d">${formatHUF(c.paid)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:${c.unpaid > 0 ? '#d97706' : '#9ca3af'}">${formatHUF(c.unpaid)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:${(c.profit || 0) >= 0 ? '#15803d' : '#dc2626'};font-weight:${(c.allocatedCosts || 0) > 0 ? '600' : '400'}">${(c.allocatedCosts || 0) > 0 ? formatHUF(c.profit) : '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${c.isExisting ? 'Meglévő ügyfél' : 'Prospect'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#9ca3af">${c.lastActivity || '—'}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ügyfelek riport — ${periodLabels[period] || period}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #9ca3af; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; color: #9ca3af; text-transform: uppercase; border-bottom: 2px solid #f3f4f6; }
    tr:hover { background: #f9fafb; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Ügyfelek riport</h1>
  <p class="meta">Időszak: ${periodLabels[period] || period} · Ügyfelek száma: ${clients.length} · Generálva: ${new Date().toLocaleDateString('hu-HU')}</p>
  <table>
    <thead>
      <tr>
        <th>Ügyfél</th>
        <th>Bevétel</th>
        <th>Fizetve</th>
        <th>Kifizetetlen</th>
        <th>Profit</th>
        <th>Státusz</th>
        <th>Utolsó aktivitás</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="7" style="padding:16px;text-align:center;color:#9ca3af">Nincs adat</td></tr>'}
    </tbody>
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
    a.download = 'ugyfelek-riport.html';
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

  function handleCopy() {
    const header = ['Ügyfél', 'Bevétel', 'Fizetve', 'Kifizetetlen', 'Profit', 'Státusz', 'Utolsó aktivitás'].join('\t');
    const rows = clients.map((c) => [
      c.name,
      c.totalRevenue,
      c.paid,
      c.unpaid,
      (c.allocatedCosts || 0) > 0 ? (c.profit || 0) : '',
      c.isExisting ? 'Meglévő ügyfél' : 'Prospect',
      c.lastActivity || '',
    ].join('\t')).join('\n');
    navigator.clipboard.writeText(header + '\n' + rows).catch(() => {});
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 800, width: '95vw', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Ügyfelek riport</h2>
            <p className="text-xs text-gray-400 mt-0.5">{periodLabels[period] || period} · {clients.length} ügyfél</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none cursor-pointer">×</button>
        </div>

        {/* Táblázat előnézet */}
        <div className="card p-0 overflow-x-auto mb-5">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['Ügyfél', 'Bevétel', 'Fizetve', 'Kifizetetlen', 'Profit', 'Státusz', 'Utolsó aktivitás'].map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-gray-400 font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-gray-400">Nincs adat</td></tr>
              ) : clients.map((c) => (
                <tr key={c.name} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{c.name}</td>
                  <td className="py-2 px-3 font-semibold text-green-700">{formatHUF(c.totalRevenue)}</td>
                  <td className="py-2 px-3 text-green-600">{formatHUF(c.paid)}</td>
                  <td className={`py-2 px-3 ${c.unpaid > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                    {formatHUF(c.unpaid)}
                  </td>
                  <td className={`py-2 px-3 ${(c.allocatedCosts || 0) > 0 ? ((c.profit || 0) >= 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold') : 'text-gray-300'}`}>
                    {(c.allocatedCosts || 0) > 0 ? formatHUF(c.profit) : '—'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.isExisting ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isExisting ? 'Meglévő' : 'Prospect'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{c.lastActivity || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gombok */}
        <div className="flex gap-3">
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
            onClick={handleCopy}
            className="flex-1 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            📋 Másolás (Sheets)
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
