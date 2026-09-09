'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface CreateSubscriptionDiscountInput {
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  max_discount_amount?: number | null
  duration_type: 'once' | 'forever' | 'repeating'
  duration_in_cycles?: number | null
  applicable_plan_ids?: string[] | null
  razorpay_offer_id?: string | null
  min_order_amount?: number
  max_uses?: number | null
  uses_per_user?: number
  valid_from?: string | null
  valid_until?: string | null
  is_active?: boolean
}

export async function createSubscriptionDiscountCodeAction(input: CreateSubscriptionDiscountInput) {
  try {
    const normalizedCode = input.code.trim().toUpperCase()
    if (!normalizedCode) return { error: 'Code is required' }

    // Check existing
    const { data: existing } = await ((supabaseAdmin as any)
      .from('subscription_discount_codes'))
      .select('id')
      .eq('code', normalizedCode)
      .maybeSingle()

    if (existing) {
      return { error: 'A discount code with this name already exists.' }
    }

    const { data: promo, error: insertError } = await ((supabaseAdmin as any)
      .from('subscription_discount_codes'))
      .insert({
        code: normalizedCode,
        description: input.description || null,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        max_discount_amount: input.max_discount_amount || null,
        duration_type: input.duration_type || 'once',
        duration_in_cycles: input.duration_type === 'repeating' ? (input.duration_in_cycles || 1) : null,
        applicable_plan_ids: input.applicable_plan_ids && input.applicable_plan_ids.length > 0 ? input.applicable_plan_ids : null,
        razorpay_offer_id: input.razorpay_offer_id || null,
        min_order_amount: input.min_order_amount || 0,
        max_uses: input.max_uses || null,
        uses_per_user: input.uses_per_user || 1,
        valid_from: input.valid_from ? new Date(input.valid_from).toISOString() : new Date().toISOString(),
        valid_until: input.valid_until ? new Date(input.valid_until).toISOString() : null,
        is_active: input.is_active !== undefined ? input.is_active : true,
      })
      .select()
      .single()

    if (insertError) {
      return { error: 'Failed to create discount code: ' + insertError.message }
    }

    revalidatePath('/admin/subscription-discounts')
    return { success: true, promo }
  } catch (error: any) {
    return { error: error.message || 'Unexpected error' }
  }
}

export async function getSubscriptionDiscountCodesAction() {
  try {
    const { data, error } = await ((supabaseAdmin as any)
      .from('subscription_discount_codes'))
      .select(`
        *,
        subscription_discount_code_uses (
          id,
          discount_amount,
          applied_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { success: true, data: data || [] }
  } catch (error: any) {
    return { error: error.message || 'Unexpected error' }
  }
}

export async function toggleSubscriptionDiscountCodeAction(id: string, isActive: boolean) {
  try {
    const { error: updateError } = await ((supabaseAdmin as any)
      .from('subscription_discount_codes'))
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) return { error: updateError.message }

    revalidatePath('/admin/subscription-discounts')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Unexpected error' }
  }
}

export async function deleteSubscriptionDiscountCodeAction(id: string) {
  try {
    const { error: deleteError } = await ((supabaseAdmin as any)
      .from('subscription_discount_codes'))
      .delete()
      .eq('id', id)

    if (deleteError) return { error: deleteError.message }

    revalidatePath('/admin/subscription-discounts')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Unexpected error' }
  }
}
