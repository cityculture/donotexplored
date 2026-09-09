'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Tag, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Percent,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react'
import {
  createSubscriptionDiscountCodeAction,
  getSubscriptionDiscountCodesAction,
  toggleSubscriptionDiscountCodeAction,
  deleteSubscriptionDiscountCodeAction,
  CreateSubscriptionDiscountInput
} from '@/actions/subscription-promo.actions'

export default function SubscriptionDiscountsPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<CreateSubscriptionDiscountInput>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    max_discount_amount: null,
    duration_type: 'once',
    duration_in_cycles: null,
    applicable_plan_ids: null,
    razorpay_offer_id: '',
    min_order_amount: 0,
    max_uses: null,
    uses_per_user: 1,
    valid_from: '',
    valid_until: '',
    is_active: true
  })

  const [selectedPlanOption, setSelectedPlanOption] = useState<'all' | 'yearly' | 'monthly'>('all')

  const fetchCodes = async () => {
    setLoading(true)
    const res = await getSubscriptionDiscountCodesAction()
    if (res.success && res.data) {
      setCodes(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleSubscriptionDiscountCodeAction(id, !currentStatus)
    if (res.success) {
      setCodes(codes.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription discount code?')) return
    const res = await deleteSubscriptionDiscountCodeAction(id)
    if (res.success) {
      setCodes(codes.filter(c => c.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setActionError(null)

    let planIds: string[] | null = null
    if (selectedPlanOption === 'yearly') {
      const yearlyId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY
      planIds = yearlyId ? [yearlyId, 'plan_yearly', 'yearly'] : ['plan_yearly', 'yearly']
    } else if (selectedPlanOption === 'monthly') {
      const monthlyId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY
      planIds = monthlyId ? [monthlyId, 'plan_monthly', 'monthly'] : ['plan_monthly', 'monthly']
    }

    const payload: CreateSubscriptionDiscountInput = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: Number(formData.discount_value),
      max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
      duration_in_cycles: formData.duration_type === 'repeating' ? Number(formData.duration_in_cycles || 1) : null,
      applicable_plan_ids: planIds,
      min_order_amount: Number(formData.min_order_amount || 0),
      max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      uses_per_user: Number(formData.uses_per_user || 1),
    }

    const res = await createSubscriptionDiscountCodeAction(payload)
    if (!res.success) {
      setActionError(res.error || 'Failed to create discount code')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setModalOpen(false)
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      max_discount_amount: null,
      duration_type: 'once',
      duration_in_cycles: null,
      applicable_plan_ids: null,
      razorpay_offer_id: '',
      min_order_amount: 0,
      max_uses: null,
      uses_per_user: 1,
      valid_from: '',
      valid_until: '',
      is_active: true
    })
    fetchCodes()
  }

  const totalRedemptions = codes.reduce((acc, curr) => acc + (curr.used_count || 0), 0)
  const totalDiscountGranted = codes.reduce((acc, curr) => {
    const uses = curr.subscription_discount_code_uses || []
    return acc + uses.reduce((subAcc: number, u: any) => subAcc + (Number(u.discount_amount) || 0), 0)
  }, 0)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            <span>Subscription Discount Codes</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage discount codes, billing recurrence rules, and usage tracking for subscriptions.
          </p>
        </div>
        <button
          onClick={() => {
            setActionError(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Code</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-indigo-600">
            <Tag className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Active Codes</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{codes.filter(c => c.is_active).length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-emerald-600">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Total Redemptions</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalRedemptions}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-amber-600">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Total Discounts Given</span>
          </div>
          <p className="text-3xl font-black text-gray-900">₹{totalDiscountGranted.toFixed(2)}</p>
        </div>
      </div>

      {/* Codes Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">All Subscription Codes</h2>
          <span className="text-xs font-bold text-gray-400">{codes.length} Codes Configured</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No discount codes yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Create your first discount code to offer first-cycle or recurring discounts on subscriptions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Billing Recurrence</th>
                  <th className="py-4 px-6">Redemptions</th>
                  <th className="py-4 px-6">Validity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Code & Description */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                          {code.code}
                        </span>
                      </div>
                      {code.description && (
                        <p className="text-[11px] text-gray-400 mt-1 truncate max-w-xs">{code.description}</p>
                      )}
                    </td>

                    {/* Discount Type & Value */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        {code.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{code.discount_value}% OFF</span>
                            {code.max_discount_amount && (
                              <span className="text-[10px] text-gray-400 font-normal">(Max ₹{code.max_discount_amount})</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-emerald-600">₹</span>
                            <span>₹{code.discount_value} OFF</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Recurrence Model */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        code.duration_type === 'once'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : code.duration_type === 'forever'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {code.duration_type === 'once' && 'First Cycle Only'}
                        {code.duration_type === 'forever' && 'Every Cycle (Forever)'}
                        {code.duration_type === 'repeating' && `${code.duration_in_cycles || 1} Cycles`}
                      </span>
                    </td>

                    {/* Redemptions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                        <span>{code.used_count || 0}</span>
                        <span className="text-gray-400 font-normal">/ {code.max_uses ? code.max_uses : '∞'}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Max {code.uses_per_user || 1}/user</p>
                    </td>

                    {/* Validity */}
                    <td className="py-4 px-6">
                      <div className="text-xs text-gray-600">
                        {code.valid_until ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>Ends {new Date(code.valid_until).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">No expiration</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggle(code.id, code.is_active)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                          code.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {code.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{code.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900">Create Subscription Discount</h3>
                <p className="text-xs text-gray-400 mt-0.5">Configure new discount rules for subscription checkouts</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              {actionError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Code Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME50, SPECIAL20"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-bold uppercase tracking-wider text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special launch discount for early adopters"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Discount Type & Value Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-bold text-gray-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Discount Value * ({formData.discount_type === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.discount_value}
                    onChange={e => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-bold text-gray-900"
                  />
                </div>
              </div>

              {/* Max Discount Cap (for percentage) */}
              {formData.discount_type === 'percentage' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Max Discount Cap (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for no maximum cap"
                    value={formData.max_discount_amount || ''}
                    onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>
              )}

              {/* Duration / Billing Recurrence Dropdown */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Billing Recurrence Rule</span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Apply Discount To *
                  </label>
                  <select
                    value={formData.duration_type}
                    onChange={e => setFormData({ ...formData, duration_type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 outline-none text-sm font-bold text-gray-900"
                  >
                    <option value="once">First Billing Cycle Only (Once)</option>
                    <option value="forever">Every Recurring Billing Cycle (Forever)</option>
                    <option value="repeating">Custom Number of Billing Cycles (Repeating)</option>
                  </select>
                </div>

                {formData.duration_type === 'repeating' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                      Number of Billing Cycles *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration_in_cycles || 2}
                      onChange={e => setFormData({ ...formData, duration_in_cycles: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 outline-none text-sm font-bold text-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* Plan Restriction & Min Order Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Applicable Plan
                  </label>
                  <select
                    value={selectedPlanOption}
                    onChange={e => setSelectedPlanOption(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-bold text-gray-900"
                  >
                    <option value="all">All Subscription Plans</option>
                    <option value="yearly">Yearly Plan Only</option>
                    <option value="monthly">Monthly Plan Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Min Plan Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_amount || 0}
                    onChange={e => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Max Total Uses (Global)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.max_uses || ''}
                    onChange={e => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Uses Per User
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.uses_per_user || 1}
                    onChange={e => setFormData({ ...formData, uses_per_user: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from || ''}
                    onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Valid Until (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Razorpay Offer ID (Optional) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Razorpay Offer ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="offer_xxxx (if created directly on Razorpay)"
                  value={formData.razorpay_offer_id || ''}
                  onChange={e => setFormData({ ...formData, razorpay_offer_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none text-sm font-mono text-gray-900"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
