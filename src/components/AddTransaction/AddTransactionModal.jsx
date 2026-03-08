import { useState } from 'react';
import { formatHUF } from '../../utils/formatters';

const VAT_RATES = [0, 5, 18, 27];

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  type: 'bevétel',
  category: '',
  partner: '',
  amount: '',
  vatRate: 27,
  status: 'fizetve',
  notes: '',
  projectType: null,
};

export default function AddTransactionModal({
  onClose,
  onAdd,
  onUpdate,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onAddExpenseCategory,
  editMode = false,
  initialData = null,
  knownPartners = [],
}) {
  const [form, setForm] = useState(() => {
    if (editMode && initialData) {
      return {
        date: initialData.date,
        type: initialData.type,
        category: initialData.category,
        partner: initialData.partner || '',
        amount: String(initialData.amount),
        vatRate: initialData.vatRate ?? 27,
        status: initialData.status,
        notes: initialData.notes || '',
        projectType: initialData.projectType || null,
      };
    }
    return defaultForm;
  });

  const categories = form.type === 'bevétel' ? incomeCategories : expenseCategories;
  const netAmount = form.amount ? Math.round(Number(form.amount) / (1 + form.vatRate / 100)) : null;
  const vatAmount = netAmount && form.amount ? Number(form.amount) - netAmount : null;

  function set(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === 'type' ? { category: '' } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.category || !form.amount) return;
    const payload = {
      ...form,
      amount: Number(form.amount),
      vatRate: Number(form.vatRate),
    };
    try {
      if (editMode) {
        await onUpdate(payload);
      } else {
        await onAdd(payload);
      }
      onClose();
    } catch (err) {
      alert(`Mentés sikertelen:\n\n${err.message}`);
    }
  }

  function handleAddCategory() {
    const name = prompt('Új bevételi kategória neve:');
    if (name?.trim()) {
      onAddCategory(name.trim());
      set('category', name.trim());
    }
  }

  function handleAddExpenseCategory() {
    const name = prompt('Új kiadási kategória neve:');
    if (name?.trim()) {
      onAddExpenseCategory(name.trim());
      set('category', name.trim());
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {editMode ? 'Tranzakció szerkesztése' : 'Új tranzakció'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none p-0 cursor-pointer">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Dátum + Típus */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Dátum *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Típus *</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {['bevétel', 'kiadás'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                      form.type === t
                        ? t === 'bevétel'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kategória */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Kategória *</label>
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                <option value="">— Válassz —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {form.type === 'bevétel' && (
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50"
                >
                  + Új
                </button>
              )}
              {form.type === 'kiadás' && (
                <button
                  type="button"
                  onClick={handleAddExpenseCategory}
                  className="px-3 py-2 text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50"
                >
                  + Új
                </button>
              )}
            </div>
          </div>

          {/* Partner */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Partner / Szállító</label>
            <input
              type="text"
              list="partners-list"
              value={form.partner}
              onChange={(e) => set('partner', e.target.value)}
              placeholder="pl. TechVision Kft"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
            {knownPartners.length > 0 && (
              <datalist id="partners-list">
                {knownPartners.map((p) => <option key={p} value={p} />)}
              </datalist>
            )}
          </div>

          {/* Összeg + ÁFA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bruttó összeg (Ft) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="0"
                min={0}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ÁFA kulcs</label>
              <select
                value={form.vatRate}
                onChange={(e) => set('vatRate', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                {VAT_RATES.map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nettó összeg */}
          {netAmount !== null && (
            <div className="bg-purple-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Nettó: </span>
              <span className="font-semibold text-purple-700">{formatHUF(netAmount)}</span>
              <span className="text-gray-400 ml-3">ÁFA: </span>
              <span className="text-gray-600">{formatHUF(vatAmount)}</span>
            </div>
          )}

          {/* Projekt típus */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Projekt típus</label>
            <select
              value={form.projectType || ''}
              onChange={(e) => set('projectType', e.target.value || null)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="">— Nem meghatározott —</option>
              <option value="havi">Havi visszatérő</option>
              <option value="egyszeri">Egyszeri projekt</option>
            </select>
          </div>

          {/* Státusz */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Státusz</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {['fizetve', 'kifizetetlen'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    form.status === s
                      ? s === 'fizetve'
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-400 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Megjegyzés */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Megjegyzés</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              Mégse
            </button>
            <button type="submit" className="btn-primary flex-1 py-2 text-sm">
              {editMode ? 'Mentés' : 'Hozzáadás'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
