// src/lib/email.ts
//
// ─── Resend without a custom domain ──────────────────────────────────────────
//
// Resend gives every account a free shared sending domain:
//   onboarding@resend.dev
//
// You can send up to 100 emails/day from this address with zero DNS setup.
// This is perfect while you're building and don't have a domain yet.
//
// Limitations of the shared domain:
//   - Can only send to YOUR OWN email address (the one you signed up with)
//   - Not suitable for sending to real clients
//
// ─── What this means for BillMetry right now ─────────────────────────────────
//
// For testing: set TO_OVERRIDE in your .env.local to your own email.
//   All emails will go to you — great for testing the flow.
//
// For real use without a domain: use Gmail SMTP as a free alternative (see below).
//
// For production: buy any cheap domain (~$1-5/year on Namecheap or Hostinger),
//   add 3 DNS records in Resend, verify in ~10 minutes. Well worth it.
//
// ─── .env.local additions ────────────────────────────────────────────────────
//
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   EMAIL_FROM=onboarding@resend.dev
//   # During testing — all emails redirect here so you can inspect them:
//   EMAIL_TO_OVERRIDE=your@email.com

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Uses onboarding@resend.dev if EMAIL_FROM is not set
const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

// If set, ALL emails go to this address instead of the real recipient.
// Use this during development so you can test without a real domain.
const TO_OVERRIDE = process.env.EMAIL_TO_OVERRIDE

function resolveTo(realEmail: string): string {
  return TO_OVERRIDE ?? realEmail
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceEmailParams {
  to: string
  clientName: string
  freelancerName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  paymentLink: string
  invoiceViewLink: string
}

interface ReceiptEmailParams {
  to: string
  clientName: string
  invoiceNumber: string
  amount: string
  paidAt: string
}

interface FreelancerPaidParams {
  to: string
  freelancerName: string
  clientName: string
  invoiceNumber: string
  amount: string
  paidAt: string
}

interface OverdueReminderParams {
  to: string
  clientName: string
  freelancerName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  paymentLink: string
  daysOverdue: number
}

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td style="padding-bottom:24px;text-align:center;">
        <span style="font-size:13px;font-weight:700;color:#2563EB;letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;">
          BillMetry
        </span>
      </td></tr>
      <tr><td style="background:#FFFFFF;border-radius:16px;padding:36px 36px 32px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        ${body}
      </td></tr>
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="font-size:11px;color:#94A3B8;margin:0;">
          Powered by BillMetry · Professional invoicing for African freelancers
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function btn(label: string, href: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${href}" style="display:inline-block;background:#2563EB;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;">${label}</a>
  </div>`
}

function amountBox(label: string, value: string, color = '#EFF6FF', border = '#BFDBFE'): string {
  return `<div style="background:${color};border:1px solid ${border};border-radius:10px;padding:16px 20px;margin:20px 0;">
    <p style="font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;font-family:monospace;">${label}</p>
    <p style="font-size:22px;font-weight:700;color:#0F172A;margin:0;font-family:monospace;">${value}</p>
  </div>`
}

// ─── 1. Invoice email → client ─────────────────────────────────────────────

export async function sendInvoiceEmail(params: InvoiceEmailParams) {
  return resend.emails.send({
    from:    FROM,
    to:      resolveTo(params.to),
    subject: `Invoice ${params.invoiceNumber} from ${params.freelancerName} — ${params.amount} due`,
    html: wrap(`
      <h1 style="font-size:20px;font-weight:700;color:#0F172A;margin:0 0 8px;">Hi ${params.clientName},</h1>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;">
        You have a new invoice from <strong>${params.freelancerName}</strong>.
      </p>
      ${amountBox(`Invoice ${params.invoiceNumber} · Due ${params.dueDate}`, params.amount)}
      <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 4px;">
        Pay securely using the button below — card, bank transfer, and USSD accepted.
      </p>
      ${btn('Pay invoice →', params.paymentLink)}
      <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
        Or <a href="${params.invoiceViewLink}" style="color:#2563EB;">view the full invoice here</a>.
      </p>
    `),
  })
}

// ─── 2. Payment receipt → client ──────────────────────────────────────────

export async function sendReceiptEmail(params: ReceiptEmailParams) {
  return resend.emails.send({
    from:    FROM,
    to:      resolveTo(params.to),
    subject: `Payment confirmed — Invoice ${params.invoiceNumber}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:52px;height:52px;background:#F0FDF4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;">✓</div>
      </div>
      <h1 style="font-size:20px;font-weight:700;color:#0F172A;margin:0 0 8px;text-align:center;">Payment confirmed!</h1>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;text-align:center;">
        Hi ${params.clientName}, your payment has been received.
      </p>
      ${amountBox(`Invoice ${params.invoiceNumber} · Paid ${params.paidAt}`, params.amount, '#F0FDF4', '#BBF7D0')}
      <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
        This email is your receipt. Thank you for your prompt payment.
      </p>
    `),
  })
}

// ─── 3. Paid notification → freelancer ───────────────────────────────────

export async function sendFreelancerPaidNotification(params: FreelancerPaidParams) {
  return resend.emails.send({
    from:    FROM,
    to:      resolveTo(params.to),
    subject: `💰 Payment received — ${params.amount} from ${params.clientName}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:16px;font-size:40px;">🎉</div>
      <h1 style="font-size:20px;font-weight:700;color:#0F172A;margin:0 0 8px;text-align:center;">You've been paid!</h1>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;text-align:center;">
        <strong>${params.clientName}</strong> just paid invoice <strong>${params.invoiceNumber}</strong>.
      </p>
      ${amountBox(`Amount received · ${params.paidAt}`, params.amount, '#EFF6FF', '#BFDBFE')}
      <p style="font-size:12px;color:#64748B;text-align:center;margin:0 0 16px;">
        The money is on its way to your bank account via Flutterwave.
      </p>
      ${btn('View dashboard →', `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard`)}
    `),
  })
}

// ─── 4. Overdue reminder → client ─────────────────────────────────────────

export async function sendOverdueReminder(params: OverdueReminderParams) {
  const urgency = params.daysOverdue >= 7
    ? 'This invoice is significantly overdue and requires immediate attention.'
    : 'This is a friendly reminder that payment is now past due.'

  return resend.emails.send({
    from:    FROM,
    to:      resolveTo(params.to),
    subject: `[Reminder] Invoice ${params.invoiceNumber} — ${params.daysOverdue} day${params.daysOverdue !== 1 ? 's' : ''} overdue`,
    html: wrap(`
      <h1 style="font-size:20px;font-weight:700;color:#0F172A;margin:0 0 8px;">Payment reminder</h1>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;">
        Hi ${params.clientName}, your invoice from <strong>${params.freelancerName}</strong>
        was due on <strong>${params.dueDate}</strong>. ${urgency}
      </p>
      ${amountBox(
        `Outstanding · ${params.daysOverdue} day${params.daysOverdue !== 1 ? 's' : ''} overdue`,
        params.amount,
        '#FEF2F2',
        '#FECACA'
      )}
      ${btn('Pay now →', params.paymentLink)}
      <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
        If you have already paid, please disregard this reminder.
      </p>
    `),
  })
}