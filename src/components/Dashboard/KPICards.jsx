import { formatHUF } from '../../utils/formatters';

function KPICard({ title, value, color, bg, subtitle, icon }) {
  return (
    <div
      className="card flex flex-col gap-1 relative overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
        <span className="text-lg" style={{ opacity: 0.6 }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-0.5" style={{ color }}>
        {formatHUF(value)}
      </p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default function KPICards({ kpis }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
