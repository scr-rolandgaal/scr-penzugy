import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatHUF } from '../../utils/formatters';

const COLORS = [
  '#6C3FC5', '#4A6CF7', '#22C55E', '#F97316', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card text-sm shadow-lg border border-purple-100">
      <p className="font-bold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{formatHUF(payload[0].value)}</p>
    </div>
  );
}

function SinglePie({ data, title }) {
  if (!data?.length) return (
    <div className="card flex flex-col items-center justify-center h-48">
      <p className="font-bold text-gray-600 mb-2">{title}</p>
      <p className="text-gray-400 text-sm">Nincs adat</p>
    </div>
  );

  return (
    <div className="card">
      <h3 className="font-bold text-gray-700 mb-2 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={75}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CategoryPieCharts({ incomeBreakdown, expenseBreakdown }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SinglePie data={incomeBreakdown} title="Bevételi kategóriák" />
      <SinglePie data={expenseBreakdown} title="Kiadási kategóriák" />
    </div>
  );
}
