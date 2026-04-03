import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = 'BillMetry <invoices@billmetry.com>' // update to your verified domain

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceEmailParams {
  to: string
  clientName: string
  freelancerName: string
  invoiceNumber: string
  amount: string          // pre-formatted e.g. "₦120,000"
  dueDate: string         // pre-formatted e.g. "15 January 2026"
  paymentLink: string
  invoiceViewLink: string // public view page
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

function wrapEmail(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head>
    <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

            <!-- Logo bar -->
            <tr><td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:13px;font-weight:700;color:#2563EB;letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;">
                BillMetry
              </span>
            </td></tr>

            <!-- Card -->
            <tr><td style="background:#FFFFFF;border-radius:16px;padding:36px 36px 32px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              ${body}
            </td></tr>

            <!-- Footer -->
            <tr><td style="padding-top:24px;text-align:center;">
              <p style="font-size:11px;color:#94A3B8;margin:0;">
                Powered by BillMetry · Professional invoicing for African freelancers
              </p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}

function btn(text: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block;background:#2563EB;color:#fff;font-size:14px;font-weight:700;
      padding:14px 28px;border-radius:999px;text-decoration:none;margin-top:8px;">
      ${text}
    </a>
  `
}

function h1(text: string): string {
  return `<h1 style="font-size:20px;font-weight:700;color:#0F172A;margin:0 0 8px;">${text}</h1>`
}

function p(text: string, muted = false): string {
  return `<p style="font-size:14px;color:${muted ? '#64748B' : '#334155'};line-height:1.6;margin:0 0 12px;">${text}</p>`
}

function amountBox(label: string, value: string): string {
  return `
    <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;font-family:monospace;">${label}</p>
      <p style="font-size:22px;font-weight:700;color:#0F172A;margin:0;font-family:monospace;">${value}</p>
    </div>
  `
}

// ─── 1. Invoice email (sent to client) ───────────────────────────────────────

export async function sendInvoiceEmail(params: InvoiceEmailParams) {
  const html = wrapEmail(`
    ${h1(`Hi ${params.clientName},`)}
    ${p(`You have a new invoice from <strong>${params.freelancerName}</strong>.`)}
    ${amountBox(`Invoice ${params.invoiceNumber} — Due ${params.dueDate}`, params.amount)}
    ${p('Click the button below to view and pay securely.', true)}
    <div style="text-align:center;margin:24px 0;">
      ${btn('Pay invoice →', params.paymentLink)}
    </div>
    ${p(`Or <a href="${params.invoiceViewLink}" style="color:#2563EB;">view the full invoice here</a>.`, true)}
  `)

  return resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `Invoice ${params.invoiceNumber} from ${params.freelancerName} — ${params.amount} due`,
    html,
  })
}

// ─── 2. Payment receipt (sent to client after paying) ────────────────────────

export async function sendReceiptEmail(params: ReceiptEmailParams) {
  const html = wrapEmail(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:48px;height:48px;background:#F0FDF4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-size:22px;">✓</span>
      </div>
    </div>
    ${h1('Payment received!')}
    ${p(`Hi ${params.clientName}, your payment has been confirmed.`)}
    ${amountBox(`Invoice ${params.invoiceNumber} · Paid ${params.paidAt}`, params.amount)}
    ${p('Thank you for your prompt payment. This email is your receipt.', true)}
  `)

  return resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `Payment confirmed — Invoice ${params.invoiceNumber}`,
    html,
  })
}

// ─── 3. Freelancer paid notification ─────────────────────────────────────────

export async function sendFreelancerPaidNotification(params: FreelancerPaidParams) {
  const html = wrapEmail(`
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:36px;">🎉</span>
    </div>
    ${h1("You've been paid!")}
    ${p(`<strong>${params.clientName}</strong> just paid invoice <strong>${params.invoiceNumber}</strong>.`)}
    ${amountBox(`Amount received · ${params.paidAt}`, params.amount)}
    ${p('The money is on its way to your bank account via Flutterwave.', true)}
    <div style="text-align:center;margin-top:24px;">
      ${btn('View invoice', `${process.env.NEXT_PUBLIC_APP_URL}/invoices`)}
    </div>
  `)

  return resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `💰 Payment received — ${params.amount} from ${params.clientName}`,
    html,
  })
}

// ─── 4. Overdue reminder (sent to client) ────────────────────────────────────

export async function sendOverdueReminder(params: OverdueReminderParams) {
  const urgency = params.daysOverdue >= 7
    ? 'This invoice is now significantly overdue.'
    : 'This is a friendly reminder that payment is now past due.'

  const html = wrapEmail(`
    ${h1(`Payment reminder — ${params.invoiceNumber}`)}
    ${p(`Hi ${params.clientName},`)}
    ${p(`${urgency} Your invoice from <strong>${params.freelancerName}</strong> was due on <strong>${params.dueDate}</strong>.`)}
    ${amountBox(`Outstanding · ${params.daysOverdue} day${params.daysOverdue !== 1 ? 's' : ''} overdue`, params.amount)}
    ${p('Please complete payment at your earliest convenience.', true)}
    <div style="text-align:center;margin:24px 0;">
      ${btn('Pay now →', params.paymentLink)}
    </div>
    ${p('If you have already paid, please disregard this message.', true)}
  `)

  return resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `[Reminder] Invoice ${params.invoiceNumber} — payment overdue by ${params.daysOverdue} day${params.daysOverdue !== 1 ? 's' : ''}`,
    html,
  })
}