'use client'

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoicePDFData {
  invoiceNumber:   string
  status:          string
  currency:        string
  subtotal:        number
  taxRate:         number
  taxAmount:       number
  total:           number
  dueDate:         string
  createdAt:       string
  notes:           string | null
  businessName:    string
  businessEmail:   string
  businessPhone:   string | null
  businessAddress: string | null
  logoUrl:         string | null
  clientName:      string
  clientEmail:     string
  clientPhone:     string | null
  clientAddress:   string | null
  clientCountry:   string | null
  items: {
    description: string
    quantity:    number
    rate:        number
    amount:      number
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sym: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

function fmt(amount: number, currency: string): string {
  // react-pdf doesn't handle the ₦ unicode well — swap to NGN text as fallback
  const s = sym[currency]
  if (!s) return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  // NGN symbol sometimes renders as box — use text fallback
  const symbol = currency === 'NGN' ? 'NGN ' : s
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft:   'DRAFT',
    sent:    'AWAITING PAYMENT',
    viewed:  'VIEWED',
    paid:    'PAID',
    overdue: 'OVERDUE',
  }
  return map[status] ?? status.toUpperCase()
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft:   '#94A3B8',
    sent:    '#3B82F6',
    viewed:  '#8B5CF6',
    paid:    '#10B981',
    overdue: '#EF4444',
  }
  return map[status] ?? '#64748B'
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY    = '#0F172A'
const BLUE    = '#2563EB'
const LIGHT   = '#F8FAFC'
const MUTED   = '#64748B'
const BORDER  = '#E2E8F0'
const WHITE   = '#FFFFFF'
const DARK    = '#1E293B'

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // ── Page ────────────────────────────────────────────────────────────────────
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: DARK,
    backgroundColor: WHITE,
  },

  // ── Top accent bar ─────────────────────────────────────────────────────────
  // The #2563EB blue stripe across the very top of the page
  accentBar: {
    height: 4,
    backgroundColor: BLUE,
    marginBottom: 0,
  },

  // ── Header area ─────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 48,
    paddingTop: 36,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  // Left: logo + business name stacked
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 44, height: 44, borderRadius: 8,
  },
  logoFallback: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    color: WHITE, fontSize: 16, fontFamily: 'Helvetica-Bold',
  },
  businessBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  businessName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  businessEmail: {
    fontSize: 8.5,
    color: MUTED,
  },
  businessPhone: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 1,
  },
  businessAddress: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 1,
    maxWidth: 180,
  },

  // Right: INVOICE + number + status badge
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceWord: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
  },

  // ── Metadata row (dates) ─────────────────────────────────────────────────────
  metaSection: {
    flexDirection: 'row',
    paddingHorizontal: 48,
    paddingVertical: 20,
    gap: 40,
    backgroundColor: LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  metaItem: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
  },

  // ── From / To section ────────────────────────────────────────────────────────
  partiesSection: {
    flexDirection: 'row',
    paddingHorizontal: 48,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 40,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  party: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.55,
  },

  // ── Line items table ──────────────────────────────────────────────────────────
  tableSection: {
    paddingHorizontal: 48,
    paddingTop: 28,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    marginBottom: 0,
  },
  th: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  // Alternating row background
  tableRowAlt: {
    backgroundColor: '#FAFBFC',
  },
  colDesc:   { flex: 1, paddingRight: 8 },
  colQty:    { width: 44, textAlign: 'center' },
  colRate:   { width: 80, textAlign: 'right' },
  colAmount: { width: 88, textAlign: 'right' },
  td: {
    fontSize: 9,
    color: DARK,
  },
  tdMuted: {
    fontSize: 9,
    color: MUTED,
  },

  // ── Totals ────────────────────────────────────────────────────────────────────
  totalsSection: {
    paddingHorizontal: 48,
    paddingTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: MUTED,
  },
  totalValue: {
    fontSize: 9,
    color: DARK,
  },
  dividerLine: {
    width: 220,
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: BLUE,
    borderRadius: 4,
    marginTop: 4,
  },
  grandLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  grandValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },

  // ── Notes ─────────────────────────────────────────────────────────────────────
  notesSection: {
    marginHorizontal: 48,
    marginTop: 24,
    padding: 14,
    backgroundColor: LIGHT,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.65,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerAccent: {
    height: 3,
    backgroundColor: BLUE,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerLeft: {
    fontSize: 7.5,
    color: MUTED,
  },
  footerBrand: {
    fontSize: 7.5,
    color: BLUE,
    fontFamily: 'Helvetica-Bold',
  },
  footerRight: {
    fontSize: 7.5,
    color: '#94A3B8',
  },
})

// ─── Document ─────────────────────────────────────────────────────────────────

export function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  const initials = (data.businessName || 'BM')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const badgeBg = `${statusColor(data.status)}18`
  const badgeFg = statusColor(data.status)

  return (
    <Document
      title={`${data.invoiceNumber} — ${data.businessName}`}
      author={data.businessName}
      subject={`Invoice ${data.invoiceNumber}`}
    >
      <Page size="A4" style={s.page}>

        {/* ── Top accent bar ── */}
        <View style={s.accentBar} />

        {/* ── Header: logo + business name LEFT, INVOICE + number RIGHT ── */}
        <View style={s.header}>

          {/* Left side — logo then business identity */}
          <View style={s.headerLeft}>
            {data.logoUrl ? (
              <Image src={data.logoUrl} style={s.logoImage} />
            ) : (
              <View style={s.logoFallback}>
                <Text style={s.logoInitials}>{initials}</Text>
              </View>
            )}

            <View style={s.businessBlock}>
              {/* Business name — large, bold, prominent */}
              <Text style={s.businessName}>{data.businessName}</Text>
              <Text style={s.businessEmail}>{data.businessEmail}</Text>
              {data.businessPhone && (
                <Text style={s.businessPhone}>{data.businessPhone}</Text>
              )}
              {data.businessAddress && (
                <Text style={s.businessAddress}>{data.businessAddress}</Text>
              )}
            </View>
          </View>

          {/* Right side — INVOICE heading + number + status */}
          <View style={s.headerRight}>
            <Text style={s.invoiceWord}>INVOICE</Text>
            <Text style={s.invoiceNumber}>{data.invoiceNumber}</Text>
            <View style={[s.statusBadge, { backgroundColor: badgeBg }]}>
              <Text style={[s.statusText, { color: badgeFg }]}>
                {statusLabel(data.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Dates bar (light grey background) ── */}
        <View style={s.metaSection}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Issue date</Text>
            <Text style={s.metaValue}>{fmtDate(data.createdAt)}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Due date</Text>
            <Text style={[s.metaValue, data.status === 'overdue' ? { color: '#EF4444' } : {}]}>
              {fmtDate(data.dueDate)}
            </Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Currency</Text>
            <Text style={s.metaValue}>{data.currency}</Text>
          </View>
        </View>

        {/* ── From / To ── */}
        <View style={s.partiesSection}>
          <View style={s.party}>
            <Text style={s.partyLabel}>From</Text>
            {/* Business name repeated here for clarity in the bill-from block */}
            <Text style={s.partyName}>{data.businessName}</Text>
            <Text style={s.partyDetail}>{data.businessEmail}</Text>
            {data.businessPhone   && <Text style={s.partyDetail}>{data.businessPhone}</Text>}
            {data.businessAddress && <Text style={s.partyDetail}>{data.businessAddress}</Text>}
          </View>

          <View style={s.party}>
            <Text style={s.partyLabel}>Bill to</Text>
            <Text style={s.partyName}>{data.clientName}</Text>
            <Text style={s.partyDetail}>{data.clientEmail}</Text>
            {data.clientPhone   && <Text style={s.partyDetail}>{data.clientPhone}</Text>}
            {data.clientCountry && <Text style={s.partyDetail}>{data.clientCountry}</Text>}
            {data.clientAddress && <Text style={s.partyDetail}>{data.clientAddress}</Text>}
          </View>
        </View>

        {/* ── Line items table ── */}
        <View style={s.tableSection}>

          {/* Table header */}
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colDesc]}>Description</Text>
            <Text style={[s.th, s.colQty]}>Qty</Text>
            <Text style={[s.th, s.colRate]}>Unit price</Text>
            <Text style={[s.th, s.colAmount]}>Amount</Text>
          </View>

          {/* Rows — alternating background */}
          {data.items.map((item, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.td, s.colDesc]}>{item.description}</Text>
              <Text style={[s.tdMuted, s.colQty, { textAlign: 'center' }]}>
                {item.quantity}
              </Text>
              <Text style={[s.tdMuted, s.colRate]}>
                {fmt(item.rate, data.currency)}
              </Text>
              <Text style={[s.td, s.colAmount, { fontFamily: 'Helvetica-Bold' }]}>
                {fmt(item.amount, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsSection}>
          {/* Subtotal */}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(data.subtotal, data.currency)}</Text>
          </View>

          {/* Tax — only shown if > 0 */}
          {data.taxRate > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={s.totalValue}>{fmt(data.taxAmount, data.currency)}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={s.dividerLine} />

          {/* Grand total — blue pill */}
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total due</Text>
            <Text style={s.grandValue}>{fmt(data.total, data.currency)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {data.notes && (
          <View style={s.notesSection}>
            <Text style={s.notesLabel}>Notes &amp; payment terms</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* ── Footer — fixed so it appears on every page ── */}
        <View style={s.footer} fixed>
          <View style={s.footerAccent} />
          <View style={s.footerContent}>
            <Text style={s.footerLeft}>
              {data.businessName}  ·  {data.businessEmail}
            </Text>
            <Text style={s.footerBrand}>BillMetry</Text>
            <Text style={s.footerRight}>{data.invoiceNumber}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}

export default InvoiceDocument