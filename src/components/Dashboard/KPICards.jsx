import { formatHUF } from '../../utils/formatters';

function KPICard({ title, value, color, subtitle, icon }) {
  return (
    <div
      className="card flex flex-col gap-1 relative overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
        <span className="text-lg" style={{ opacity: 0.6 }}>{icon}</span>
      </div>
      <p className="text-lg sm:text-2xl font-bold mt-0.5 break-all" style={{ color }}>
        {formatHUF(value)}
      </p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

function ProjectTypeCard({ ratio }) {
  const hasData = ratio && ratio.total > 0;
  return (
    <div
      className="card flex flex-col gap-1 relative overflow-hidden"
      style={{ borderTop: '3px solid var(--secondary)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Visszatérő / Egyszeri</p>
        <span className="text-lg" style={{ opacity: 0.6 }}>♻</span>
      </div>
      {hasData ? (
        <>
          <div className="flex items-end gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
              {ratio.haviPct}%
            </span>
            <span className="text-sm text-gray-400 mb-0.5">havi</span>
          </div>
          {/* Arány sáv */}
          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 mt-1">
            <div
              className="bg-blue-400 transition-all"
              style={{ width: `${ratio.haviPct}%` }}
            />
            <div
              className="bg-orange-400 transition-all"
              style={{ width: `${ratio.egyszeriPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Egyszeri: {ratio.egyszeriPct}%</p>
        </>
      ) : (
        <p className="text-sm text-gray-300 mt-1">Nincs adat</p>
      )}
    </div>
  );
}

export default function KPICards({ kpis, projectTypeRatio }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <KPICard
        title="Összes Bevétel"
        value={kpis.income}
        color="#22C55E"
        icon="↑"
      />
      <KPICard
        title="Összes Kiadás"
        value={kpis.expense}
        color="#EF4444"
        icon="↓"
      />
      <KPICard
        title="Egyenleg"
        value={kpis.balance}
        color={kpis.balance >= 0 ? '#7B5CF6' : '#EF4444'}
        icon="≡"
      />
      <KPICard
        title="Kifizetetlen"
        value={kpis.unpaid}
        color="#F97316"
        subtitle="Várható bevétel"
        icon="⏳"
      />
      <ProjectTypeCard ratio={projectTypeRatio} />
    </div>
  );
}
