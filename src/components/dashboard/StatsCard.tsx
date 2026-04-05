// src/components/dashboard/StatsCard.tsx
// Redesigned to handle multi-currency cleanly.
// Instead of squeezing "₦120,000 · $800" into one card,
// we show the primary currency large and others stacked below.

interface StatsCardProps {
  label:   string
  amounts: { currency: string; value: number }[]   // one entry per currency
  sub?:    string
  accent?: 'blue' | 'green' | 'amber' | 'red'
  icon:    React.ReactNode
  // For simple count stats (overdue count etc.)
  count?:  string
}

const accentMap = {
  blue:  { iconBg: 'rgba(37,99,235,0.12)',  iconColor: '#60A5FA', border: 'rgba(96,165,250,0.12)',  bar: '#2563EB' },
  green: { iconBg: 'rgba(16,185,129,0.1)',  iconColor: '#34D399', border: 'rgba(52,211,153,0.12)',  bar: '#10B981' },
  amber: { iconBg: 'rgba(245,158,11,0.1)',  iconColor: '#FBBF24', border: 'rgba(251,191,36,0.12)',  bar: '#F59E0B' },
  red:   { iconBg: 'rgba(239,68,68,0.1)',   iconColor: '#F87171', border: 'rgba(248,113,113,0.12)', bar: '#EF4444' },
}

const currencySymbols: Record<string, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€',
}

function fmt(value: number, currency: string, compact = false): string {
  const sym = currencySymbols[currency] ?? `${currency} `
  if (compact && value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`
  if (compact && value >= 1_000)    return `${sym}${(value / 1_000).toFixed(0)}K`
  return `${sym}${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function StatsCard({ label, amounts, sub, accent = 'blue', icon, count }: StatsCardProps) {
  const a = accentMap[accent]

  // Filter out zero amounts, sort by value descending
  const nonZero = amounts.filter(a => a.value > 0).sort((x, y) => y.value - x.value)
  const primary = nonZero[0]
  const others  = nonZero.slice(1)

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
        border: `1px solid ${a.border}`,
      }}
    >
      {/* Top row */}
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
        {count !== undefined ? (
          // Simple count display (e.g. overdue count)
          <div
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {count}
          </div>
        ) : nonZero.length === 0 ? (
          // All zeros
          <div className="text-2xl font-bold text-slate-600"
            style={{ fontFamily: 'var(--font-mono), monospace' }}>
            —
          </div>
        ) : (
          <>
            {/* Primary currency — large */}
            <div
              className="text-2xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {fmt(primary.value, primary.currency, true)}
            </div>

            {/* Secondary currencies — smaller, stacked */}
            {others.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {others.map(({ currency, value }) => (
                  <span
                    key={currency}
                    className="text-xs px-2 py-0.5 rounded-md"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: '#64748B',
                    }}
                  >
                    {fmt(value, currency, true)}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {sub && (
          <p className="text-xs text-slate-600 mt-1.5">{sub}</p>
        )}
      </div>

      {/* Thin accent bar at bottom */}
      <div
        className="h-0.5 rounded-full mt-auto"
        style={{ background: `${a.bar}20` }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: nonZero.length > 0 ? '60%' : '0%', background: a.bar, transition: 'width 0.5s ease' }}
        />
      </div>
    </div>
  )
}