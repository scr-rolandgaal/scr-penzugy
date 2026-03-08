import { formatHUF, monthLabelFull } from '../../utils/formatters';

export default function CashflowTable({ data }) {
  return (
    <div className="card overflow-x-auto">
      <h3 className="font-bold text-gray-700 mb-4">Havi Cashflow (2026)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-purple-100">
            {['Hónap', 'Bevétel', 'Kiadás', 'Cashflow', 'Kumulált egyenleg'].map((h) => (
              <th key={h} className="text-left py-2 px-2 text-gray-500 font-semibold text-xs uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const hasActivity = row.bevétel > 0 || row.kiadás > 0;
            return (
              <tr
                key={i}
                className={`border-b border-gray-50 ${hasActivity ? '' : 'text-gray-300'}`}
              >
                <td className="py-2 px-2 font-medium">{monthLabelFull(row.monthIndex)}</td>
                <td className="py-2 px-2 text-green-600">{row.bevétel > 0 ? formatHUF(row.bevétel) : '—'}</td>
                <td className="py-2 px-2 text-red-500">{row.kiadás > 0 ? formatHUF(row.kiadás) : '—'}</td>
                <td className={`py-2 px-2 font-semibold ${row.cashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {hasActivity ? formatHUF(row.cashflow) : '—'}
                </td>
                <td className={`py-2 px-2 font-bold ${row.cumulative >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                  {hasActivity ? formatHUF(row.cumulative) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
