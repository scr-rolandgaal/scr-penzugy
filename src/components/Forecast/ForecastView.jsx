import { useState } from 'react';
import ForecastForm from './ForecastForm';
import { formatHUF, formatDate } from '../../utils/formatters';

const KANBAN_STATUSES = ['Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban'];
const ALL_STATUSES = [...KANBAN_STATUSES, 'Sikeres üzlet'];

const STATUS_COLORS = {
  Lead: { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280', dot: '#9CA3AF' },
  Tárgyalás: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B82F6' },
  Megerősített: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' },
  Folyamatban: { bg: '#FAF5FF', border: '#DDD6FE', text: '#6C3FC5', dot: '#8B5CF6' },
  'Sikeres üzlet': { bg: '#ECFDF5', border: '#6EE7B7', text: '#059669', dot: '#10B981' },
};

function ForecastCard({ fc, onStatusChange, onDelete }) {
  const colors = STATUS_COLORS[fc.status] || STATUS_COLORS['Lead'];
  return (
    <div
      className="rounded-xl p-3 mb-2 border text-sm"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 truncate">{fc.clientName}</p>
          <p className="text-gray-500 text-xs">{fc.projectType}</p>
        </div>
        <button
          onClick={() => onDelete(fc.id)}
          className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-base shrink-0"
        >
          ×
        </button>
      </div>
      <p className="font-bold mt-1" style={{ color: colors.text }}>
        {formatHUF(fc.expectedAmount)}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{formatDate(fc.expectedDate)}</p>
      {fc.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">{fc.notes}</p>}
      <select
        value={fc.status}
        onChange={(e) => onStatusChange(fc.id, e.target.value)}
        className="mt-2 w-full border rounded-lg px-2 py-1 text-xs focus:outline-none"
        style={{ borderColor: colors.border, color: colors.text, background: 'white' }}
      >
        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

export default function ForecastView({ forecasts, onAdd, onStatusChange, onDelete, knownClients = [] }) {
  const [showForm, setShowForm] = useState(false);

  const bevételForecasts = forecasts.filter((f) => (f.forecastType || 'bevétel') === 'bevétel');
  const kiadásForecasts = forecasts.filter((f) => f.forecastType === 'kiadás');

  const kanbanForecasts = bevételForecasts.filter((f) => f.status !== 'Sikeres üzlet');
  const wonDeals = bevételForecasts.filter((f) => f.status === 'Sikeres üzlet');

  const totalPipeline = kanbanForecasts.reduce((s, f) => s + f.expectedAmount, 0);
  const confirmed = kanbanForecasts
    .filter((f) => f.status === 'Megerősített' || f.status === 'Folyamatban')
    .reduce((s, f) => s + f.expectedAmount, 0);
  const totalExpenses = kiadásForecasts.reduce((s, f) => s + f.expectedAmount, 0);
  const totalWon = wonDeals.reduce((s, f) => s + f.expectedAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Revenue Tervezés</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          + Új tétel
        </button>
      </div>

      {/* KPI összesítők */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Pipeline értéke</p>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{formatHUF(totalPipeline)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Megerősített</p>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--green)' }}>{formatHUF(confirmed)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Lezárt ügyletek</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">{formatHUF(totalWon)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Tervezett kiadás</p>
          <p className="text-xl font-bold mt-1 text-red-500">{formatHUF(totalExpenses)}</p>
        </div>
      </div>

      {/* ── Bevétel Pipeline (kanban) ─────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Bevétel Pipeline</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_STATUSES.map((status) => {
            const items = kanbanForecasts.filter((f) => f.status === status);
            const colors = STATUS_COLORS[status];
            const colTotal = items.reduce((s, f) => s + f.expectedAmount, 0);
            return (
              <div key={status} className="flex flex-col">
                <div
                  className="rounded-xl px-3 py-2 mb-3 flex items-center justify-between"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
                    <span className="text-sm font-bold" style={{ color: colors.text }}>{status}</span>
                    <span className="text-xs bg-white rounded-full px-1.5 py-0.5" style={{ color: colors.text }}>
                      {items.length}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: colors.text }}>
                    {formatHUF(colTotal)}
                  </span>
                </div>
                <div>
                  {items.map((fc) => (
                    <ForecastCard
                      key={fc.id}
                      fc={fc}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="text-center text-gray-300 text-xs py-6 border-2 border-dashed border-gray-100 rounded-xl">
                      Nincs tétel
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lezárt ügyletek (Sikeres üzlet) ──────────────────── */}
      {wonDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
            Lezárt ügyletek — Sikeres üzlet
          </h3>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Partner', 'Projekt típus', 'Összeg', 'Dátum', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wonDeals.map((fc) => (
                  <tr key={fc.id} className="border-t border-gray-50 hover:bg-green-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{fc.clientName}</td>
                    <td className="py-3 px-4 text-gray-500">{fc.projectType}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatHUF(fc.expectedAmount)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(fc.expectedDate)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onDelete(fc.id)}
                        className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-base"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tervezett Kiadások (lista) ───────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Tervezett Kiadások</h3>
        {kiadásForecasts.length === 0 ? (
          <div className="card text-center text-gray-400 text-sm py-8">
            Még nincs tervezett kiadás. Kattints a „+ Új tétel" gombra, majd válaszd a <strong>Kiadás</strong> típust.
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Partner / Szállító', 'Kategória', 'Összeg', 'ÁFA', 'Ügyfél', 'Dátum', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kiadásForecasts.map((fc) => (
                  <tr key={fc.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{fc.clientName}</td>
                    <td className="py-3 px-4 text-gray-500">{fc.projectType}</td>
                    <td className="py-3 px-4 font-bold text-red-600">{formatHUF(fc.expectedAmount)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{fc.vatRate ? `${fc.vatRate}%` : '—'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{fc.forClient || '—'}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(fc.expectedDate)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onDelete(fc.id)}
                        className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-base"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ForecastForm onClose={() => setShowForm(false)} onAdd={onAdd} knownClients={knownClients} />
      )}
    </div>
  );
}
