// src/hooks/usePlan.ts
// Client-side hook for checking plan limits and triggering upgrade prompts.
// Use this in any component that needs to gate features.

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Plan = 'free' | 'pro' | 'business'

export interface PlanInfo {
  plan:               Plan
  invoicesThisMonth:  number
  invoiceLimit:       number | null   // null = unlimited
  canCreateInvoice:   boolean
  canAccessAnalytics: boolean
  canRemoveBranding:  boolean
  loading:            boolean
}

const PLAN_LIMITS: Record<Plan, { invoices: number | null }> = {
  free:     { invoices: 3    },
  pro:      { invoices: null },   // unlimited
  business: { invoices: null },   // unlimited
}

export function usePlan(): PlanInfo {
  const [plan, setPlan]   = useState<Plan>('free')
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Fetch plan and invoice count in parallel
      const [profileRes, countRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single(),

        supabase
          .rpc('get_monthly_invoice_count', { p_user_id: user.id }),
      ])

      const userPlan = (profileRes.data?.plan ?? 'free') as Plan
      const monthCount = countRes.data ?? 0

      setPlan(userPlan)
      setCount(monthCount)
      setLoading(false)
    }

    load()
  }, [])

  const limit = PLAN_LIMITS[plan].invoices

  return {
    plan,
    invoicesThisMonth:  count,
    invoiceLimit:       limit,
    canCreateInvoice:   limit === null || count < limit,
    canAccessAnalytics: plan !== 'free',
    canRemoveBranding:  plan !== 'free',
    loading,
  }
}