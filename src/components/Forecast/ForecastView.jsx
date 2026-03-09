import { useState } from 'react';
import ForecastForm from './ForecastForm';
import { formatHUF, formatDate } from '../../utils/formatters';

const STATUSES = ['Lead', 'Tárgyalás', 'Megerősített', 'Folyamatban'];

const STATUS_COLORS = {
  Lead: { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280', dot: '#9CA3AF' },
  Tárgyalás: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B82F6' },
  Megerősített: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' },
  Folyamatban: { bg: '#FAF5FF', border: '#DDD6FE', text: '#6C3FC5', dot: '#8B5CF6' },
};

function ForecastCard({ fc, onStatusChange, onDelete, canEdit }) {
  const colors = STATUS_COLORS[fc.status];
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
        {canEdit && (
          <button
            onClick={() => onDelete(fc.id)}
            className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-base shrink-0"
          >
            ×
          </button>
        )}
      </div>
      <p className="font-bold mt-1" style={{ color: colors.text }}>
        {formatHUF(fc.expectedAmount)}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{formatDate(fc.expectedDate)}</p>
      {fc.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">{fc.notes}</p>}
      {canEdit ? (
        <select
          value={fc.status}
          onChange={(e) => onStatusChange(fc.id, e.target.value)}
          className="mt-2 w-full border rounded-lg px-2 py-1 text-xs focus:outline-none"
          style={{ borderColor: colors.border, color: colors.text, background: 'white' }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <span
          className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full"
          style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
        >
          {fc.status}
        </span>
      )}
    </div>
  );
}

export default function ForecastView({ forecasts, onAdd, onStatusChange, onDelete, canEdit = true }) {
  const [showForm, setShowForm] = useState(false);

  const totalPipeline = forecasts.reduce((s, f) => s + f.expectedAmount, 0);
  const confirmed = forecasts
    .filter((f) => f.status === 'Megerősített' || f.status === 'Folyamatban')
    .reduce((s, f) => s + f.expectedAmount, 0);
  const monthlyAvg = forecasts.length ? Math.round(totalPipeline / 3) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Revenue Tervezés</h2>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            + Új tétel
          </button>
        )}
      </div>

      {/* KPI összesítők */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pipeline értéke', value: totalPipeline, color: 'var(--primary)' },
          { label: 'Megerősített', value: confirmed, color: 'var(--green)' },
          { label: 'Havi átlag (est.)', value: monthlyAvg, color: 'var(--secondary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold mt-1" style={{ color }}>{formatHUF(value)}</p>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map((status) => {
          const items = forecasts.filter((f) => f.status === status);
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
                    canEdit={canEdit}
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

      {showForm && (
        <ForecastForm onClose={() => setShowForm(false)} onAdd={onAdd} />
      )}
    </div>
  );
}
