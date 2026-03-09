import { formatHUF, monthLabelFull } from '../../utils/formatters';

export default function CashflowTable({ data }) {
  return (
    <div className="card p-0">
      <h3 className="font-bold text-gray-700 px-5 pt-5 pb-4">Havi Cashflow</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-purple-100">
              {[
                { full: 'Hónap', short: 'Hónap' },
                { full: 'Bevétel', short: 'Bev.' },
                { full: 'Kiadás', short: 'Kiad.' },
                { full: 'Cashflow', short: 'CF' },
                { full: 'Kumulált egyenleg', short: 'Kumulált' },
              ].map(({ full, short }) => (
                <th key={full} className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase whitespace-nowrap">
                  <span className="hidden sm:inline">{full}</span>
                  <span className="sm:hidden">{short}</span>
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
                  <td className="py-2 px-3 font-medium whitespace-nowrap">
                    <span className="hidden sm:inline">{monthLabelFull(row.monthIndex)}</span>
                    <span className="sm:hidden">{monthLabelFull(row.monthIndex).slice(0, 3)}.</span>
                  </td>
                  <td className="py-2 px-3 text-green-600 whitespace-nowrap">{row.bevétel > 0 ? formatHUF(row.bevétel) : '—'}</td>
                  <td className="py-2 px-3 text-red-500 whitespace-nowrap">{row.kiadás > 0 ? formatHUF(row.kiadás) : '—'}</td>
                  <td className={`py-2 px-3 font-semibold whitespace-nowrap ${row.cashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {hasActivity ? formatHUF(row.cashflow) : '—'}
                  </td>
                  <td className={`py-2 px-3 font-bold whitespace-nowrap ${row.cumulative >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                    {hasActivity ? formatHUF(row.cumulative) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
