import { EXPENSE_CATEGORIES } from '../../data/sampleData';

const MONTHS = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December',
];

export default function TransactionFilters({ filters, setFilters, incomeCategories }) {
  const allCategories = [...new Set([...incomeCategories, ...EXPENSE_CATEGORIES])].sort();

  function set(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  const selectCls = 'w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white';

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-center">
      <select
        value={filters.month}
        onChange={(e) => set('month', e.target.value)}
        className={selectCls}
      >
        <option value="">Minden hónap</option>
        {MONTHS.map((m, i) => (
          <option key={i} value={i}>{m}</option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => set('type', e.target.value)}
        className={selectCls}
      >
        <option value="">Mindkét típus</option>
        <option value="bevétel">Bevétel</option>
        <option value="kiadás">Kiadás</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        className={selectCls}
      >
        <option value="">Minden kategória</option>
        {allCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set('status', e.target.value)}
        className={selectCls}
      >
        <option value="">Minden státusz</option>
        <option value="fizetve">Fizetve</option>
        <option value="kifizetetlen">Kifizetetlen</option>
      </select>

      <button
        onClick={() => setFilters({ month: '', type: '', category: '', status: '' })}
        className="col-span-2 sm:col-span-1 text-sm text-purple-500 hover:text-purple-700 bg-transparent border-none cursor-pointer text-left sm:text-center"
      >
        Szűrők törlése ×
      </button>
    </div>
  );
}
