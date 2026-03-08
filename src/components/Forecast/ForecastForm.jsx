import { useState } from 'react';
import { INCOME_CATEGORIES_DEFAULT } from '../../data/sampleData';

const STATUSES = ['Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban'];

const defaultForm = {
  clientName: '',
  projectType: INCOME_CATEGORIES_DEFAULT[0],
  expectedAmount: '',
  expectedDate: new Date().toISOString().slice(0, 10),
  status: 'Lead',
  notes: '',
};

export default function ForecastForm({ onClose, onAdd }) {
  const [form, setForm] = useState(defaultForm);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName || !form.expectedAmount) return;
    onAdd({ ...form, expectedAmount: Number(form.expectedAmount) });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Új forecast tétel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none cursor-pointer">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ügyfél neve *</label>
            <input
              value={form.clientName}
              onChange={(e) => set('clientName', e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Projekt típus</label>
              <select
                value={form.projectType}
                onChange={(e) => set('projectType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                {INCOME_CATEGORIES_DEFAULT.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Státusz</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Várható összeg (Ft) *</label>
              <input
                type="number"
                value={form.expectedAmount}
                onChange={(e) => set('expectedAmount', e.target.value)}
                min={0}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Várható dátum</label>
              <input
                type="date"
                value={form.expectedDate}
                onChange={(e) => set('expectedDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Megjegyzés</label>
            <input
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
              Mentés
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
