import { useState } from 'react';
import { INCOME_CATEGORIES_DEFAULT, FORECAST_EXPENSE_CATEGORIES } from '../../data/sampleData';

const BEVÉTEL_STATUSES = ['Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban', 'Sikeres üzlet'];
const VAT_RATES = [0, 5, 18, 27];

const defaultForm = {
  forecastType: 'bevétel',
  clientName: '',
  projectType: INCOME_CATEGORIES_DEFAULT[0],
  expectedAmount: '',
  expectedDate: new Date().toISOString().slice(0, 10),
  status: 'Lead',
  notes: '',
  forClient: '',
  vatRate: 0,
};

export default function ForecastForm({ onClose, onAdd, knownClients = [] }) {
  const [form, setForm] = useState(defaultForm);

  const isBevétel = form.forecastType === 'bevétel';
  const categoryOptions = isBevétel ? INCOME_CATEGORIES_DEFAULT : FORECAST_EXPENSE_CATEGORIES;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTypeToggle(type) {
    setForm((f) => ({
      ...f,
      forecastType: type,
      projectType: type === 'bevétel' ? INCOME_CATEGORIES_DEFAULT[0] : FORECAST_EXPENSE_CATEGORIES[0],
      status: type === 'bevétel' ? 'Lead' : 'Megerősített',
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName || !form.expectedAmount) return;
    onAdd({
      ...form,
      expectedAmount: Number(form.expectedAmount),
      vatRate: Number(form.vatRate),
    });
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
          {/* Bevétel / Kiadás toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Típus</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {['bevétel', 'kiadás'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeToggle(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                    form.forecastType === t
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

          {/* Ügyfél / Partner neve */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {isBevétel ? 'Ügyfél neve *' : 'Partner / Szállító *'}
            </label>
            <input
              value={form.clientName}
              onChange={(e) => set('clientName', e.target.value)}
              required
              placeholder={isBevétel ? 'pl. TechVision Kft' : 'pl. Grafikus alvállalkozó'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {isBevétel ? 'Projekt típus' : 'Kategória'}
              </label>
              <select
                value={form.projectType}
                onChange={(e) => set('projectType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              {isBevétel ? (
                <>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Státusz</label>
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  >
                    {BEVÉTEL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Várható dátum</label>
                  <input
                    type="date"
                    value={form.expectedDate}
                    onChange={(e) => set('expectedDate', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {isBevétel ? 'Várható összeg (Ft) *' : 'Tervezett összeg (Ft) *'}
              </label>
              <input
                type="number"
                value={form.expectedAmount}
                onChange={(e) => set('expectedAmount', e.target.value)}
                min={0}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            {isBevétel ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Várható dátum</label>
                <input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) => set('expectedDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ÁFA kulcs</label>
                <select
                  value={form.vatRate}
                  onChange={(e) => set('vatRate', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                >
                  {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Kiadás: Ügyfél/Projekt mező (profitabilitás) */}
          {!isBevétel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Ügyfél / Projekt (profitabilitáshoz)
              </label>
              <input
                list="forecast-clients-list"
                value={form.forClient}
                onChange={(e) => set('forClient', e.target.value)}
                placeholder="pl. TechVision Kft (opcionális)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
              {knownClients.length > 0 && (
                <datalist id="forecast-clients-list">
                  {knownClients.map((c) => <option key={c} value={c} />)}
                </datalist>
              )}
            </div>
          )}

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
