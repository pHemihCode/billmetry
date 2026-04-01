// StatsCard — reusable metric card used on the dashboard overview
// Accepts a label, value, delta (optional trend), and accent colour

interface StatsCardProps {
  label: string
  value: string
  sub?: string            // e.g. "vs last month"
  delta?: number          // positive = up, negative = down
  accent?: 'blue' | 'green' | 'amber' | 'red'
  icon: React.ReactNode
}

const accentMap = {
  blue:  { iconBg: 'rgba(37,99,235,0.12)',  iconColor: '#60A5FA', border: 'rgba(96,165,250,0.12)'  },
  green: { iconBg: 'rgba(16,185,129,0.1)',  iconColor: '#34D399', border: 'rgba(52,211,153,0.12)'  },
  amber: { iconBg: 'rgba(245,158,11,0.1)',  iconColor: '#FBBF24', border: 'rgba(251,191,36,0.12)'  },
  red:   { iconBg: 'rgba(239,68,68,0.1)',   iconColor: '#F87171', border: 'rgba(248,113,113,0.12)' },
}

export default function StatsCard({ label, value, sub, delta, accent = 'blue', icon }: StatsCardProps) {
  const a = accentMap[accent]

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9) 0%, rgba(8,14,28,0.95) 100%)',
        border: `1px solid ${a.border}`,
      }}
    >
      {/* Top row — icon + label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-wide">{label}</span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: a.iconBg }}
        >
          <span style={{ color: a.iconColor }}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div>
        <div
          className="text-2xl font-bold text-white tracking-tight mono"
        >
          {value}
        </div>

        {/* Optional delta + sub text */}
        {(delta !== undefined || sub) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {delta !== undefined && (
              <span
                className="text-xs font-semibold"
                style={{ color: delta >= 0 ? '#34D399' : '#F87171' }}
              >
                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
              </span>
            )}
            {sub && <span className="text-xs text-slate-600">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  )
}