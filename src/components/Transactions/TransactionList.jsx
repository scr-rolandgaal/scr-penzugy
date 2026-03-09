import { useState, useMemo } from 'react';
import TransactionRow from './TransactionRow';
import TransactionFilters from './TransactionFilters';
import AddTransactionModal from '../AddTransaction/AddTransactionModal';
import BankImportModal from '../Import/BankImportModal';

export default function TransactionList({
  transactions,
  incomeCategories,
  expenseCategories,
  onToggleStatus,
  onDelete,
  onDeleteBulk,
  onAdd,
  onAddBulk,
  onAddCategory,
  canEdit = true,
  canManageCategories = true,
  onAddExpenseCategory,
  onUpdateTransaction,
  knownPartners,
}) {
  const [filters, setFilters] = useState({ month: '', type: '', category: '', status: '' });
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.month !== '' && new Date(tx.date).getMonth() !== Number(filters.month)) return false;
      if (filters.type && tx.type !== filters.type) return false;
      if (filters.category && tx.category !== filters.category) return false;
      if (filters.status && tx.status !== filters.status) return false;
      return true;
    });
  }, [transactions, filters]);

  function handleSelect(id, checked) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked) {
    setSelected(checked ? new Set(filtered.map((tx) => tx.id)) : new Set());
  }

  function handleBulkDelete() {
    if (!selected.size) return;
    if (window.confirm(`Biztosan törlöd a(z) ${selected.size} kijelölt tételt?`)) {
      onDeleteBulk([...selected]);
      setSelected(new Set());
    }
  }

  function handleEdit(txId) {
    const tx = transactions.find((t) => t.id === txId);
    if (tx) setEditingTx(tx);
  }

  const allSelected = filtered.length > 0 && filtered.every((tx) => selected.has(tx.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Tranzakciók</h2>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="text-sm px-3 py-2 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <span className="hidden sm:inline">↑ Bank Import</span>
              <span className="sm:hidden">↑ Import</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-sm"
            >
              <span className="hidden sm:inline">+ Tranzakció hozzáadása</span>
              <span className="sm:hidden">+ Hozzáadás</span>
            </button>
          </div>
        )}
      </div>

      {/* Szűrők */}
      <div className="card">
        <TransactionFilters filters={filters} setFilters={setFilters} incomeCategories={incomeCategories} />
      </div>

      {/* Bulk toolbar */}
      {canEdit && selected.size > 0 && (
        <div className="flex items-center gap-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-purple-700">{selected.size} kijelölve</span>
          <button
            onClick={handleBulkDelete}
            className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
          >
            Törlés
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
          >
            Visszavonás
          </button>
        </div>
      )}

      {/* Táblázat */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {canEdit && (
                <th className="py-3 px-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                </th>
              )}
              {['Dátum', 'Típus', 'Kategória', 'Partner', 'Összeg', 'ÁFA', 'Státusz', ''].map((h) => (
                <th
                  key={h}
                  className={`py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase ${
                    h === 'Partner' ? 'hidden md:table-cell' : h === 'ÁFA' ? 'hidden sm:table-cell' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 9 : 8} className="py-12 text-center text-gray-400 text-sm">
                  Nincs találat a szűrési feltételekre.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  selected={selected.has(tx.id)}
                  onSelect={handleSelect}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  canEdit={canEdit}
                  onEdit={handleEdit}
                />
              ))
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50">
            {filtered.length} tétel megjelenítve
          </div>
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={onAdd}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onAddCategory={onAddCategory}
          canManageCategories={canManageCategories}
          onAddExpenseCategory={onAddExpenseCategory}
          knownPartners={knownPartners}
        />
      )}

      {editingTx && (
        <AddTransactionModal
          onClose={() => setEditingTx(null)}
          onUpdate={(updates) => {
            onUpdateTransaction(editingTx.id, updates);
            setEditingTx(null);
          }}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onAddCategory={onAddCategory}
          onAddExpenseCategory={onAddExpenseCategory}
          canManageCategories={canManageCategories}
          editMode
          initialData={editingTx}
          knownPartners={knownPartners}
        />
      )}

      {canEdit && showImport && (
        <BankImportModal
          onClose={() => setShowImport(false)}
          onImport={onAddBulk}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onAddCategory={onAddCategory}
          onAddExpenseCategory={onAddExpenseCategory}
        />
      )}
    </div>
  );
}
