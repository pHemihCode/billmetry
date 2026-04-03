'use client'

import { useState } from 'react'
import {
  Document, Page, Text, View, StyleSheet, pdf, Image, Font,
} from '@react-pdf/renderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoicePDFData {
  invoiceNumber: string
  status: string
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  dueDate: string
  createdAt: string
  notes: string | null
  // Business (freelancer)
  businessName: string
  businessEmail: string
  businessPhone: string | null
  businessAddress: string | null
  logoUrl: string | null
  // Client
  clientName: string
  clientEmail: string
  clientPhone: string | null
  clientAddress: string | null
  clientCountry: string | null
  // Line items
  items: {
    description: string
    quantity: number
    rate: number
    amount: number
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sym: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

function fmt(amount: number, currency: string) {
  const s = sym[currency] ?? ''
  return `${s}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── PDF styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 48,
    paddingVertical: 48,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  logo: { width: 48, height: 48, borderRadius: 8 },
  logoFallback: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  headerRight: { alignItems: 'flex-end' },
  invoiceTitle: {
    fontSize: 22, fontFamily: 'Helvetica-Bold',
    color: '#0F172A', marginBottom: 4,
  },
  invoiceNum: { fontSize: 11, color: '#2563EB', fontFamily: 'Helvetica-Bold' },
  statusBadge: {
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, alignSelf: 'flex-end',
  },
  statusText: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  // Parties
  partiesRow: { flexDirection: 'row', marginBottom: 32, gap: 32 },
  party: { flex: 1 },
  partyLabel: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6,
  },
  partyName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 3 },
  partyDetail: { fontSize: 8.5, color: '#475569', lineHeight: 1.5 },
  // Divider
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  // Items table
  tableHeader: {
    flexDirection: 'row', paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 7.5, fontFamily: 'Helvetica-Bold',
    color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  colDesc:   { flex: 1 },
  colQty:    { width: 40, textAlign: 'center' },
  colRate:   { width: 70, textAlign: 'right' },
  colAmount: { width: 80, textAlign: 'right' },
  cellText: { fontSize: 9, color: '#334155' },
  // Totals
  totalsSection: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, paddingVertical: 3 },
  totalLabel: { fontSize: 8.5, color: '#64748B' },
  totalValue: { fontSize: 8.5, color: '#334155' },
  grandTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: 200, paddingVertical: 6, marginTop: 4,
    borderTopWidth: 1.5, borderTopColor: '#0F172A',
  },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0F172A' },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2563EB' },
  // Dates + notes
  metaRow: { flexDirection: 'row', gap: 32, marginBottom: 28 },
  metaItem: {},
  metaLabel: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3,
  },
  metaValue: { fontSize: 9, color: '#334155' },
  notes: {
    marginTop: 24, padding: 12,
    backgroundColor: '#F8FAFC', borderRadius: 6,
  },
  notesLabel: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5,
  },
  notesText: { fontSize: 8.5, color: '#475569', lineHeight: 1.6 },
  // Footer
  footer: {
    position: 'absolute', bottom: 32, left: 48, right: 48,
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: '#94A3B8' },
})

const statusColors: Record<string, { bg: string; text: string }> = {
  draft:   { bg: '#F1F5F9', text: '#64748B' },
  sent:    { bg: '#EFF6FF', text: '#2563EB' },
  viewed:  { bg: '#F5F3FF', text: '#7C3AED' },
  paid:    { bg: '#F0FDF4', text: '#16A34A' },
  overdue: { bg: '#FEF2F2', text: '#DC2626' },
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  const sc = statusColors[data.status] ?? statusColors.draft

  return (
    <Document title={`${data.invoiceNumber} — BillMetry`}>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          {/* Logo or initials */}
          {data.logoUrl ? (
            <Image src={data.logoUrl} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoText}>
                {(data.businessName || 'BM').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNum}>{data.invoiceNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{data.status}</Text>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Issue date</Text>
            <Text style={styles.metaValue}>{fmtDate(data.createdAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Due date</Text>
            <Text style={styles.metaValue}>{fmtDate(data.dueDate)}</Text>
          </View>
        </View>

        {/* From / To */}
        <View style={styles.partiesRow}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{data.businessName}</Text>
            <Text style={styles.partyDetail}>{data.businessEmail}</Text>
            {data.businessPhone   && <Text style={styles.partyDetail}>{data.businessPhone}</Text>}
            {data.businessAddress && <Text style={styles.partyDetail}>{data.businessAddress}</Text>}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>To</Text>
            <Text style={styles.partyName}>{data.clientName}</Text>
            <Text style={styles.partyDetail}>{data.clientEmail}</Text>
            {data.clientPhone   && <Text style={styles.partyDetail}>{data.clientPhone}</Text>}
            {data.clientCountry && <Text style={styles.partyDetail}>{data.clientCountry}</Text>}
            {data.clientAddress && <Text style={styles.partyDetail}>{data.clientAddress}</Text>}
          </View>
        </View>

        {/* Line items */}
        <View style={styles.divider} />
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>

        {data.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colDesc]}>{item.description}</Text>
            <Text style={[styles.cellText, styles.colQty, { textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[styles.cellText, styles.colRate]}>{fmt(item.rate, data.currency)}</Text>
            <Text style={[styles.cellText, styles.colAmount]}>{fmt(item.amount, data.currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(data.subtotal, data.currency)}</Text>
          </View>
          {data.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={styles.totalValue}>{fmt(data.taxAmount, data.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(data.total, data.currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes / payment terms</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by BillMetry</Text>
          <Text style={styles.footerText}>{data.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Download button component ────────────────────────────────────────────────
// This is what you import into invoice detail page

export default function DownloadPDFButton({ data }: { data: InvoicePDFData }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const blob = await pdf(<InvoiceDocument data={data} />).toBlob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${data.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </>
      )}
    </button>
  )
}