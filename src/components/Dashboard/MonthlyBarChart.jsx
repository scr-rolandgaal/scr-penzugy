import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatHUF } from '../../utils/formatters';

const currentMonth = new Date().getMonth(); // 0-based

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card text-sm shadow-lg border border-purple-100">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'bevétel' ? 'Bevétel' : p.name === 'kiadás' ? 'Kiadás' : p.name}:{' '}
          {formatHUF(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function MonthlyBarChart({ data, forecastData }) {
  // Merge forecast into chart data
  const chartData = data.map((row) => {
    const fc = forecastData?.find((f) => f.monthIndex === row.monthIndex);
    return {
      ...row,
      forecastBevétel: fc ? fc.expectedAmount : 0,
    };
  });

  return (
    <div className="card">
      <h3 className="font-bold text-gray-700 mb-4">Havi Bevétel / Kiadás (2026)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9e5ff" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tick={{ fontSize: 11 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(v) => (v === 'bevétel' ? 'Bevétel' : v === 'kiadás' ? 'Kiadás' : 'Forecast')} />
          <Bar dataKey="bevétel" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="kiadás" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="forecastBevétel" fill="#C4B5FD" radius={[4, 4, 0, 0]} name="Forecast" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
