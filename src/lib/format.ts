// src/lib/format.ts
// Shared formatting utilities used across dashboard pages.
// Import from here — never define fmt() inline in components.

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
}

/**
 * Formats a number as currency.
 * Always uses the currency argument — never falls back to NGN.
 *
 * formatCurrency(1200, 'USD')  → "$1,200.00"
 * formatCurrency(50000, 'NGN') → "₦50,000.00"
 * formatCurrency(800, 'GBP')   → "£800.00"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  opts: { decimals?: boolean } = { decimals: true }
): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? `${currency} `
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })
  return `${sym}${formatted}`
}

/**
 * Formats a date string to a readable format.
 * fmtDate('2026-01-15') → "15 Jan 2026"
 */
export function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats a date with full month name.
 * fmtDateLong('2026-01-15') → "15 January 2026"
 */
export function fmtDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}