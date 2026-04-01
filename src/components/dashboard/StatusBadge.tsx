// StatusBadge — renders an invoice status as a coloured pill
// Used in the invoices table, invoice detail page, and dashboard recent list

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue'

interface StatusBadgeProps {
  status: InvoiceStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  draft:   { label: 'Draft',   bg: 'rgba(100,116,139,0.1)',  text: '#94A3B8', border: 'rgba(100,116,139,0.2)',  dot: '#64748B' },
  sent:    { label: 'Sent',    bg: 'rgba(37,99,235,0.1)',    text: '#60A5FA', border: 'rgba(96,165,250,0.2)',   dot: '#3B82F6' },
  viewed:  { label: 'Viewed',  bg: 'rgba(124,58,237,0.1)',   text: '#A78BFA', border: 'rgba(167,139,250,0.2)',  dot: '#8B5CF6' },
  paid:    { label: 'Paid',    bg: 'rgba(16,185,129,0.1)',   text: '#34D399', border: 'rgba(52,211,153,0.2)',   dot: '#10B981' },
  overdue: { label: 'Overdue', bg: 'rgba(239,68,68,0.1)',    text: '#F87171', border: 'rgba(248,113,113,0.2)',  dot: '#EF4444' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = statusConfig[status] ?? statusConfig.draft

  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium rounded-full"
      style={{
        background:  c.bg,
        color:       c.text,
        border:      `1px solid ${c.border}`,
        fontSize:    size === 'sm' ? '10px' : '11px',
        padding:     size === 'sm' ? '2px 8px' : '3px 10px',
        fontFamily:  'var(--font-mono), monospace',
        letterSpacing: '0.04em',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot }}
      />
      {c.label.toUpperCase()}
    </span>
  )
}