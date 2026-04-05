'use client'

import {
  Document, Page, Text, View, StyleSheet, Image,
} from '@react-pdf/renderer'

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

function fmt(amount: number, currency: string) {
  return `${sym[currency] ?? ''}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page:        { fontFamily: 'Helvetica', fontSize: 9, color: '#1E293B', backgroundColor: '#FFFFFF', paddingHorizontal: 48, paddingVertical: 48 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  logo:        { width: 48, height: 48, borderRadius: 8 },
  logoFallback:{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  logoText:    { color: '#fff', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  headerRight: { alignItems: 'flex-end' },
  invoiceTitle:{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 4 },
  invoiceNum:  { fontSize: 11, color: '#2563EB', fontFamily: 'Helvetica-Bold' },
  badge:       { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-end', backgroundColor: '#EFF6FF' },
  badgeText:   { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#2563EB', textTransform: 'uppercase' },
  metaRow:     { flexDirection: 'row', gap: 32, marginBottom: 28 },
  metaLabel:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  metaValue:   { fontSize: 9, color: '#334155' },
  partiesRow:  { flexDirection: 'row', marginBottom: 32, gap: 32 },
  party:       { flex: 1 },
  partyLabel:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  partyName:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0F172A', marginBottom: 3 },
  partyDetail: { fontSize: 8.5, color: '#475569', lineHeight: 1.5 },
  divider:     { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 6 },
  thText:      { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 },
  tableRow:    { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  colDesc:     { flex: 1 },
  colQty:      { width: 40, textAlign: 'center' },
  colRate:     { width: 70, textAlign: 'right' },
  colAmount:   { width: 80, textAlign: 'right' },
  cellText:    { fontSize: 9, color: '#334155' },
  totalsSection:  { marginTop: 16, alignItems: 'flex-end' },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', width: 200, paddingVertical: 3 },
  totalLabel:     { fontSize: 8.5, color: '#64748B' },
  totalValue:     { fontSize: 8.5, color: '#334155' },
  grandTotalRow:  { flexDirection: 'row', justifyContent: 'space-between', width: 200, paddingVertical: 6, marginTop: 4, borderTopWidth: 1.5, borderTopColor: '#0F172A' },
  grandLabel:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0F172A' },
  grandValue:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2563EB' },
  notes:          { marginTop: 24, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6 },
  notesLabel:     { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  notesText:      { fontSize: 8.5, color: '#475569', lineHeight: 1.6 },
  footer:         { position: 'absolute', bottom: 32, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:     { fontSize: 7.5, color: '#94A3B8' },
})

// ─── PDF Document — exported so PDFDownloaderInner can import it ──────────────

export function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  const initials = (data.businessName || 'BM').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Document title={`${data.invoiceNumber} — BillMetry`}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          {data.logoUrl ? (
            <Image src={data.logoUrl} style={s.logo} />
          ) : (
            <View style={s.logoFallback}>
              <Text style={s.logoText}>{initials}</Text>
            </View>
          )}
          <View style={s.headerRight}>
            <Text style={s.invoiceTitle}>Invoice</Text>
            <Text style={s.invoiceNum}>{data.invoiceNumber}</Text>
            <View style={s.badge}><Text style={s.badgeText}>{data.status}</Text></View>
          </View>
        </View>

        {/* Dates */}
        <View style={s.metaRow}>
          <View><Text style={s.metaLabel}>Issue date</Text><Text style={s.metaValue}>{fmtDate(data.createdAt)}</Text></View>
          <View><Text style={s.metaLabel}>Due date</Text><Text style={s.metaValue}>{fmtDate(data.dueDate)}</Text></View>
        </View>

        {/* From / To */}
        <View style={s.partiesRow}>
          <View style={s.party}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>{data.businessName}</Text>
            <Text style={s.partyDetail}>{data.businessEmail}</Text>
            {data.businessPhone   && <Text style={s.partyDetail}>{data.businessPhone}</Text>}
            {data.businessAddress && <Text style={s.partyDetail}>{data.businessAddress}</Text>}
          </View>
          <View style={s.party}>
            <Text style={s.partyLabel}>To</Text>
            <Text style={s.partyName}>{data.clientName}</Text>
            <Text style={s.partyDetail}>{data.clientEmail}</Text>
            {data.clientCountry && <Text style={s.partyDetail}>{data.clientCountry}</Text>}
            {data.clientAddress && <Text style={s.partyDetail}>{data.clientAddress}</Text>}
          </View>
        </View>

        {/* Line items */}
        <View style={s.divider} />
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colDesc]}>Description</Text>
          <Text style={[s.thText, s.colQty]}>Qty</Text>
          <Text style={[s.thText, s.colRate]}>Rate</Text>
          <Text style={[s.thText, s.colAmount]}>Amount</Text>
        </View>

        {data.items.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.cellText, s.colQty, { textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[s.cellText, s.colRate]}>{fmt(item.rate, data.currency)}</Text>
            <Text style={[s.cellText, s.colAmount]}>{fmt(item.amount, data.currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(data.subtotal, data.currency)}</Text>
          </View>
          {data.taxRate > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={s.totalValue}>{fmt(data.taxAmount, data.currency)}</Text>
            </View>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>{fmt(data.total, data.currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={s.notes}>
            <Text style={s.notesLabel}>Notes / payment terms</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Generated by BillMetry</Text>
          <Text style={s.footerText}>{data.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  )
}

// Default export for backward compatibility
export default InvoiceDocument