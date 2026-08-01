import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistoryPoint } from '@/hooks/useAreaHistory'

interface AreaScoreChartProps {
  points: HistoryPoint[]
}

function formatTick(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function AreaScoreChart({ points }: AreaScoreChartProps) {
  const data = points.map((p) => ({
    at: p.at.toISOString(),
    value: p.value,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="at"
            tickFormatter={formatTick}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--line)' }}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: '0.5rem',
              color: 'var(--fg)',
            }}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            formatter={(value) => [`${value as number}`, 'Score']}
          />
          <Line
            type="stepAfter"
            dataKey="value"
            stroke="var(--healthy)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--healthy)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
