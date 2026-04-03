import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientForm from '@/components/dashboard/Invoice/ClientForm'

// This is just a thin server wrapper.
// It checks auth and renders the reusable ClientForm in "new" mode.
// If the user arrived from /invoices/new (no clients yet), we show a hint.

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { from } = await searchParams
  const fromInvoice = from === 'invoice'

  return (
    <div className="max-w-xl mx-auto">
      {fromInvoice && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-blue-300 border mb-5"
          style={{ background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(96,165,250,0.2)' }}
        >
          You need at least one client before creating an invoice. Add one below.
        </div>
      )}
      <ClientForm mode="new" />
    </div>
  )
}