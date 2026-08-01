import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  mergeSeriesByDay,
  seriesColor,
  type NamedSeries,
} from '@/domain/historySeries'

interface AreaScoreChartProps {
  series: NamedSeries[]
}

function formatDayTick(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return day
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatDayLabel(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return day
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AreaScoreChart({ series }: AreaScoreChartProps) {
  const data = mergeSeriesByDay(series)
  const multi = series.length > 1

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={formatDayTick}
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
            labelFormatter={(label) => formatDayLabel(String(label))}
            formatter={(value, name) => {
              if (value == null) return ['—', String(name)]
              return [`${value as number}`, String(name)]
            }}
          />
          {multi ? (
            <Legend
              wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }}
            />
          ) : null}
          {series.map((s, index) => (
            <Line
              key={s.id}
              type="stepAfter"
              dataKey={s.id}
              name={s.name}
              stroke={seriesColor(index)}
              strokeWidth={2}
              dot={{ r: multi ? 2 : 3, fill: seriesColor(index), strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
