import { useMemo, useState } from 'react';
import { getClientSummary } from '../../utils/calculations';
import { formatHUF } from '../../utils/formatters';
import ReportModal from './ReportModal';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Összes idő' },
  { value: 'year', label: 'Ez az év' },
  { value: 'quarter', label: 'Ez a negyedév' },
  { value: 'month', label: 'Ez a hónap' },
];

function ProjectTypeBadge({ type }) {
  if (!type) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      type === 'havi' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
    }`}>
      {type === 'havi' ? '♻ Havi' : '1x Egyszeri'}
    </span>
  );
}

function PipelineBadge({ status }) {
  if (!status) return null;
  const colors = {
    'Lead': 'bg-gray-100 text-gray-600',
    'Tárgyalás': 'bg-yellow-100 text-yellow-700',
    'Megerősített': 'bg-green-100 text-green-700',
    'Folyamatban': 'bg-blue-100 text-blue-700',
    'Sikeres üzlet': 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function ClientTypeBadge({ isExisting }) {
  return isExisting ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
      Meglévő ügyfél
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
      Prospect
    </span>
  );
}

export default function ClientsView({ transactions, forecasts }) {
  const [period, setPeriod] = useState('all');
  const [showReport, setShowReport] = useState(false);
  const clients = useMemo(
    () => getClientSummary(transactions, forecasts, period),
    [transactions, forecasts, period]
  );

  const existing = clients.filter((c) => c.isExisting);
  const prospects = clients.filter((c) => !c.isExisting);

  if (clients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 font-medium">Még nincsenek ügyfelek.</p>
        <p className="text-gray-400 text-sm mt-1">
          Adj hozzá tranzakciókat partner névvel, vagy prospects-eket a Tervezés nézetben.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header + szűrő */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ügyfelek</h2>
          <p className="text-sm text-gray-400">{clients.length} ügyfél</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowReport(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            📄 <span className="hidden sm:inline">Riport</span>
          </button>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meglévő ügyfelek */}
      {existing.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Meglévő ügyfelek ({existing.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {existing.map((client) => (
              <ClientCard key={client.name} client={client} period={period} />
            ))}
          </div>
        </div>
      )}

      {/* Potenciális ügyfelek */}
      {prospects.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Potenciális ügyfelek — Pipeline ({prospects.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prospects.map((client) => (
              <ClientCard key={client.name} client={client} period={period} />
            ))}
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal clients={clients} period={period} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

function ClientCard({ client, period }) {
  const periodLabel = period !== 'all' ? PERIOD_OPTIONS.find((p) => p.value === period)?.label : null;
  const hasAllocatedCosts = (client.allocatedCosts || 0) > 0;
  const hasWon = (client.wonRevenue || 0) > 0;

  return (
    <div className="card flex flex-col gap-3">
      {/* Fejléc */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{client.name}</h3>
          {client.lastActivity && (
            <p className="text-xs text-gray-400 mt-0.5">
              Utolsó aktivitás: {client.lastActivity}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ClientTypeBadge isExisting={client.isExisting} />
          <PipelineBadge status={client.pipelineStatus} />
          <ProjectTypeBadge type={client.projectType} />
        </div>
      </div>

      {/* Összesítők */}
      {client.isExisting ? (
        <div className="flex flex-col gap-2">
          {client.totalRevenue > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-gray-400 mb-0.5">{periodLabel || 'Összes'}</p>
                <p className="text-sm font-bold text-green-700">{formatHUF(client.totalRevenue)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-xs text-gray-400 mb-0.5">Fizetve</p>
                <p className="text-sm font-bold text-emerald-700">{formatHUF(client.paid)}</p>
              </div>
              <div className={`rounded-lg p-2 ${client.unpaid > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-400 mb-0.5">Kifizetetlen</p>
                <p className={`text-sm font-bold ${client.unpaid > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {formatHUF(client.unpaid)}
                </p>
              </div>
            </div>
          )}

          {hasWon && (
            <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
              <p className="text-xs text-gray-400 mb-0.5">🏆 Lezárt deal</p>
              <p className="text-sm font-bold text-emerald-700">{formatHUF(client.wonRevenue)}</p>
            </div>
          )}

          {hasAllocatedCosts && (
            <div className={`rounded-lg p-2 text-center ${(client.profit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-400 mb-0.5">Profit (allokált ktg. után)</p>
              <p className={`text-sm font-bold ${(client.profit || 0) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatHUF(client.profit || 0)}
              </p>
            </div>
          )}

          {client.totalRevenue === 0 && !hasWon && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-center text-gray-400">
              Még nincs lezárt tranzakció
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-center text-gray-400">
          Még nincs lezárt tranzakció
        </div>
      )}
    </div>
  );
}
