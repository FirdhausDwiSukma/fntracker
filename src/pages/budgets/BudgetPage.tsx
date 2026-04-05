import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBudgets } from '../../hooks/useBudgets'
import { useCategories } from '../../hooks/useCategories'
import type { Budget } from '../../types/budget'

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const budgetSchema = z.object({
  category_id: z.coerce.number().min(1, 'Category is required'),
  limit_amount: z.coerce.number().gt(0, 'Limit must be greater than 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function ProgressBar({ percentage }: { percentage: number }) {
  const clamped = Math.min(percentage, 100)
  const color =
    percentage >= 100 ? 'bg-[#EF4444]' : percentage >= 80 ? 'bg-[#FACC15]' : 'bg-[#22C55E]'

  return (
    <div className="w-full bg-[#F5F5F5] border-2 border-black h-5 relative">
      <div
        className={`${color} h-full transition-all`}
        style={{ width: `${clamped}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
        {percentage.toFixed(1)}%
      </span>
    </div>
  )
}

export default function BudgetPage() {
  const [filterMonth, setFilterMonth] = useState(currentMonth)
  const [filterYear, setFilterYear] = useState(currentYear)

  const { budgets, isLoading, isError, createBudget, updateBudget, deleteBudget } = useBudgets(
    filterMonth,
    filterYear,
  )
  const { categories } = useCategories()
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error'>('success')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: 0,
      limit_amount: 0,
      month: filterMonth,
      year: filterYear,
    },
  })

  function showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(null), 4000)
  }

  function openAdd() {
    setEditingId(null)
    reset({ category_id: 0, limit_amount: 0, month: filterMonth, year: filterYear })
    setShowForm(true)
    setErrorMsg(null)
  }

  function openEdit(b: Budget) {
    setEditingId(b.id)
    reset({
      category_id: b.categoryId,
      limit_amount: b.limitAmount,
      month: b.month,
      year: b.year,
    })
    setShowForm(true)
    setErrorMsg(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setErrorMsg(null)
  }

  async function onSubmit(values: BudgetFormValues) {
    setErrorMsg(null)
    try {
      if (editingId !== null) {
        await updateBudget.mutateAsync({ id: editingId, data: values })
        showToast('Budget updated successfully')
      } else {
        await createBudget.mutateAsync(values)
        showToast('Budget created successfully')
      }
      closeForm()
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  async function handleDelete(b: Budget) {
    if (!window.confirm(`Delete budget for "${b.categoryName}"?`)) return
    try {
      await deleteBudget.mutateAsync(b.id)
      showToast('Budget deleted')
    } catch {
      showToast('Failed to delete budget.', 'error')
    }
  }

  // Show warning/exceeded toasts when budgets load
  const warningBudgets = budgets.filter((b) => b.warning && !b.exceeded)
  const exceededBudgets = budgets.filter((b) => b.exceeded)

  const toastBgClass =
    toastType === 'error'
      ? 'bg-[#EF4444]'
      : toastType === 'warning'
        ? 'bg-[#FACC15] text-black'
        : 'bg-[#22C55E]'

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Budget Tracker</h1>
          <button
            onClick={openAdd}
            className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            + Add Budget
          </button>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div
            className={`mb-4 ${toastBgClass} border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-bold text-white`}
          >
            {toastMsg}
          </div>
        )}

        {/* Budget status alerts */}
        {exceededBudgets.length > 0 && (
          <div className="mb-4 bg-[#EF4444] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-bold text-white">
            ⚠ Budget exceeded:{' '}
            {exceededBudgets.map((b) => b.categoryName).join(', ')}
          </div>
        )}
        {warningBudgets.length > 0 && (
          <div className="mb-4 bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-black text-black">
            ⚡ Approaching limit:{' '}
            {warningBudgets.map((b) => b.categoryName).join(', ')}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none shadow-[2px_2px_0px_#000]"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none shadow-[2px_2px_0px_#000]"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-5">
            <h2 className="text-lg font-black mb-4">
              {editingId !== null ? 'Edit Budget' : 'Add Budget'}
            </h2>
            {errorMsg && (
              <div className="mb-3 bg-[#EF4444] border-2 border-black px-3 py-2 text-white font-bold text-sm">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block font-bold text-sm mb-1">Category (expense)</label>
                <select
                  {...register('category_id')}
                  className="w-full border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000]"
                >
                  <option value={0}>Select a category</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-[#EF4444] text-sm font-bold mt-1">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-sm mb-1">Limit Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('limit_amount')}
                  placeholder="e.g. 500000"
                  className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000]"
                />
                {errors.limit_amount && (
                  <p className="text-[#EF4444] text-sm font-bold mt-1">
                    {errors.limit_amount.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block font-bold text-sm mb-1">Month</label>
                  <select
                    {...register('month')}
                    className="w-full border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-sm mb-1">Year</label>
                  <select
                    {...register('year')}
                    className="w-full border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budget List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8 text-center font-bold text-gray-500">
              Loading budgets…
            </div>
          ) : isError ? (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8 text-center font-bold text-[#EF4444]">
              Failed to load budgets.
            </div>
          ) : budgets.length === 0 ? (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8 text-center font-bold text-gray-500">
              No budgets for {MONTH_NAMES[filterMonth - 1]} {filterYear}. Add one above.
            </div>
          ) : (
            budgets.map((b) => (
              <div
                key={b.id}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg">{b.categoryName}</span>
                      {b.exceeded && (
                        <span className="bg-[#EF4444] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Exceeded
                        </span>
                      )}
                      {b.warning && !b.exceeded && (
                        <span className="bg-[#FACC15] text-black border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Warning
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">
                      {MONTH_NAMES[b.month - 1]} {b.year}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(b)}
                      className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      disabled={deleteBudget.isPending}
                      className="bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <ProgressBar percentage={b.percentage} />

                <div className="flex justify-between mt-2 text-sm font-bold">
                  <span>
                    Used:{' '}
                    <span className={b.exceeded ? 'text-[#EF4444]' : ''}>
                      {b.usedAmount.toLocaleString()}
                    </span>
                  </span>
                  <span>Limit: {b.limitAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
