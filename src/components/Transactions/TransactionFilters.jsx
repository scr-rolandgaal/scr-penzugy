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

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={filters.month}
        onChange={(e) => set('month', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
      >
        <option value="">Minden hónap</option>
        {MONTHS.map((m, i) => (
          <option key={i} value={i}>{m}</option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => set('type', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
      >
        <option value="">Mindkettő</option>
        <option value="bevétel">Bevétel</option>
        <option value="kiadás">Kiadás</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
      >
        <option value="">Minden kategória</option>
        {allCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set('status', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
      >
        <option value="">Minden státusz</option>
        <option value="fizetve">Fizetve</option>
        <option value="kifizetetlen">Kifizetetlen</option>
      </select>

      <button
        onClick={() => setFilters({ month: '', type: '', category: '', status: '' })}
        className="text-sm text-purple-500 hover:text-purple-700 bg-transparent border-none cursor-pointer"
      >
        Szűrők törlése
      </button>
    </div>
  );
}
