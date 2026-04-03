'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartDataPoint {
  month: string
  invoiced: number
  collected: number
}

interface TopClient {
  name: string
  total: number
  paid: number
  count: number
}

interface StatusBreakdown {
  name: string
  value: number
  color: string
}

interface Summary {
  totalInvoiced: number
  totalCollected: number
  totalOverdue: number
  collectionRate: number
  avgPaymentDays: number | null
  totalCount: number
}

interface AnalyticsChartsProps {
  chartData: ChartDataPoint[]
  topClients: TopClient[]
  statusBreakdown: StatusBreakdown[]
  summary: Summary
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm border"
      style={{
        background: 'rgba(13,21,39,0.98)',
        borderColor: 'rgba(96,165,250,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-slate-400 text-xs mb-2"
        style={{ fontFamily: 'var(--font-mono), monospace' }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.fill }} />
          <span className="text-slate-400 text-xs capitalize">{entry.dataKey}</span>
          <span className="text-white text-xs font-semibold ml-auto"
            style={{ fontFamily: 'var(--font-mono), monospace' }}>
            {fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Summary stat card ────────────────────────────────────────────────────────

function Stat({
  label, value, sub, accent = '#60A5FA',
}: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-xs text-slate-500 mb-3">{label}</p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-mono), monospace', color: accent }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <h2
        className="text-sm font-semibold text-white mb-5"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsCharts({
  chartData, topClients, statusBreakdown, summary,
}: AnalyticsChartsProps) {

  if (summary.totalCount === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl border flex flex-col items-center justify-center py-24 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
          </div>
          <h3 className="text-white font-bold text-lg mb-2"
            style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
            No data yet
          </h3>
          <p className="text-slate-500 text-sm">
            Analytics will appear once you create and send invoices.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat
          label="Total invoiced"
          value={fmt(summary.totalInvoiced)}
          sub="all time"
          accent="#60A5FA"
        />
        <Stat
          label="Total collected"
          value={fmt(summary.totalCollected)}
          sub={`${summary.collectionRate}% collection rate`}
          accent="#34D399"
        />
        <Stat
          label="Outstanding"
          value={fmt(summary.totalOverdue)}
          sub="overdue invoices"
          accent="#F87171"
        />
        <Stat
          label="Avg. payment time"
          value={summary.avgPaymentDays !== null ? `${summary.avgPaymentDays}d` : '—'}
          sub="days from issue to paid"
          accent="#A78BFA"
        />
        <Stat
          label="Collection rate"
          value={`${summary.collectionRate}%`}
          sub="invoiced vs collected"
          accent="#FBBF24"
        />
        <Stat
          label="Total invoices"
          value={String(summary.totalCount)}
          sub="all time"
          accent="#64748B"
        />
      </div>

      {/* Revenue chart */}
      <Section title="Revenue — last 6 months">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => fmt(v)}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="invoiced"  fill="rgba(37,99,235,0.5)"  radius={[4, 4, 0, 0]} name="Invoiced" />
            <Bar dataKey="collected" fill="#2563EB"               radius={[4, 4, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(37,99,235,0.5)' }} />
            Invoiced
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#2563EB' }} />
            Collected
          </div>
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* Status breakdown */}
        {statusBreakdown.length > 0 && (
          <Section title="Invoice status breakdown">
            <div className="flex items-center justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={statusBreakdown}
                  cx={100} cy={100}
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-xl px-3 py-2 text-xs border"
                        style={{ background: 'rgba(13,21,39,0.98)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <p style={{ color: d.color }} className="font-semibold">{d.name}</p>
                        <p className="text-white">{d.value} invoice{d.value !== 1 ? 's' : ''}</p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </div>
            <div className="space-y-2 mt-2">
              {statusBreakdown.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm text-slate-400">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Top clients */}
        {topClients.length > 0 && (
          <Section title="Top clients by revenue">
            <div className="space-y-3">
              {topClients.map((client, i) => {
                const pct = client.total > 0
                  ? Math.round((client.paid / client.total) * 100)
                  : 0
                return (
                  <div key={client.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-slate-600 w-4"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-white font-medium">{client.name}</span>
                        <span className="text-xs text-slate-600">
                          {client.count} invoice{client.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}>
                        {fmt(client.total)}
                      </span>
                    </div>
                    {/* Collection bar */}
                    <div className="h-1 rounded-full overflow-hidden ml-6"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100 ? '#34D399' : '#2563EB',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}