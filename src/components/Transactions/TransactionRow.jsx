import { formatHUF, formatDate } from '../../utils/formatters';

export default function TransactionRow({ tx, selected, onSelect, onToggleStatus, onDelete, onEdit }) {
  const isIncome = tx.type === 'bevétel';
  const isPaid = tx.status === 'fizetve';

  return (
    <tr className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${!isPaid ? 'row-kifizetetlen' : ''}`}>
      <td className="py-3 px-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(tx.id, e.target.checked)}
          className="w-4 h-4 accent-purple-600 cursor-pointer"
        />
      </td>
      <td className="py-3 px-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(tx.date)}</td>
      <td className="py-3 px-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {isIncome ? 'Bevétel' : 'Kiadás'}
        </span>
      </td>
      <td className="py-3 px-3 text-sm font-medium text-gray-700">{tx.category}</td>
      <td className="py-3 px-3 text-sm text-gray-500 hidden md:table-cell">{tx.partner || '—'}</td>
      <td className="py-3 px-3 text-sm font-bold text-right whitespace-nowrap" style={{ color: isIncome ? 'var(--green)' : 'var(--red)' }}>
        {isIncome ? '+' : '-'}{formatHUF(tx.amount)}
      </td>
      <td className="py-3 px-3 text-center hidden sm:table-cell">
        <span className="text-xs text-gray-400">{tx.vatRate}%</span>
      </td>
      <td className="py-3 px-3">
        <button
          onClick={() => onToggleStatus(tx.id)}
          title="Státusz váltás"
          className={isPaid ? 'badge-fizetve cursor-pointer hover:opacity-80' : 'badge-kifizetetlen cursor-pointer hover:opacity-80'}
        >
          {isPaid ? 'Fizetve' : 'Kifizetetlen'}
        </button>
      </td>
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(tx.id)}
            className="text-gray-300 hover:text-blue-500 transition-colors text-base bg-transparent border-none cursor-pointer"
            title="Szerkesztés"
          >
            ✏
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Biztosan törlöd ezt a tranzakciót?\n${tx.partner} — ${formatHUF(tx.amount)}`)) {
                onDelete(tx.id);
              }
            }}
            className="text-gray-300 hover:text-red-500 transition-colors text-lg bg-transparent border-none cursor-pointer"
            title="Törlés"
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}
