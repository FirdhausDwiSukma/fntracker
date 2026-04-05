import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBudgets } from '../../hooks/useBudgets'
import { useCategories } from '../../hooks/useCategories'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
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

const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function BudgetPage() {
  const [filterMonth, setFilterMonth] = useState(currentMonth)
  const [filterYear, setFilterYear] = useState(currentYear)

  const { budgets, isLoading, isError, createBudget, updateBudget, deleteBudget } = useBudgets(filterMonth, filterYear)
  const { categories } = useCategories()
  const { toast } = useToast()
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { category_id: 0, limit_amount: 0, month: filterMonth, year: filterYear },
  })

  function openAdd() {
    setEditingId(null)
    reset({ category_id: 0, limit_amount: 0, month: filterMonth, year: filterYear })
    setShowForm(true)
  }

  function openEdit(b: Budget) {
    setEditingId(b.id)
    reset({ category_id: b.categoryId, limit_amount: b.limitAmount, month: b.month, year: b.year })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function onSubmit(values: BudgetFormValues) {
    try {
      if (editingId !== null) {
        await updateBudget.mutateAsync({ id: editingId, data: values })
        toast('Budget updated successfully')
      } else {
        await createBudget.mutateAsync(values)
        toast('Budget created successfully')
      }
      closeForm()
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteBudget.mutateAsync(deleteTarget.id)
      toast('Budget deleted')
    } catch {
      toast('Failed to delete budget.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const warningBudgets = budgets.filter((b) => b.warning && !b.exceeded)
  const exceededBudgets = budgets.filter((b) => b.exceeded)

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Budget Tracker</h1>
          <Button onClick={openAdd}>+ Add Budget</Button>
        </div>

        {/* Budget alerts */}
        {exceededBudgets.length > 0 && (
          <div className="mb-4 bg-danger border-neo-thick border-dark shadow-neo px-4 py-3 font-bold text-light">
            ⚠ Budget exceeded: {exceededBudgets.map((b) => b.categoryName).join(', ')}
          </div>
        )}
        {warningBudgets.length > 0 && (
          <div className="mb-4 bg-primary border-neo-thick border-dark shadow-neo px-4 py-3 font-black text-dark">
            ⚡ Approaching limit: {warningBudgets.map((b) => b.categoryName).join(', ')}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none shadow-neo-sm"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none shadow-neo-sm"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          open={showForm}
          onClose={closeForm}
          title={editingId !== null ? 'Edit Budget' : 'Add Budget'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Category (expense)</label>
              <select
                {...register('category_id')}
                className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none focus:shadow-neo"
              >
                <option value={0}>Select a category</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-danger text-sm font-bold">{errors.category_id.message}</p>
              )}
            </div>

            <Input
              label="Limit Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 500000"
              error={errors.limit_amount?.message}
              {...register('limit_amount')}
            />

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-bold text-sm">Month</label>
                <select
                  {...register('month')}
                  className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-bold text-sm">Year</label>
                <select
                  {...register('year')}
                  className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={isSubmitting}>
                {editingId !== null ? 'Save Changes' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Delete Budget"
        >
          <p className="font-medium mb-4">
            Delete budget for <strong>"{deleteTarget?.categoryName}"</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={confirmDelete} loading={deleteBudget.isPending}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </Modal>

        {/* Budget List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <Card>
              <div className="p-4 text-center font-bold text-gray-500">Loading budgets…</div>
            </Card>
          ) : isError ? (
            <Card>
              <div className="p-4 text-center font-bold text-danger">Failed to load budgets.</div>
            </Card>
          ) : budgets.length === 0 ? (
            <Card>
              <div className="p-4 text-center font-bold text-gray-500">
                No budgets for {MONTH_NAMES[filterMonth - 1]} {filterYear}. Add one above.
              </div>
            </Card>
          ) : (
            budgets.map((b) => (
              <Card key={b.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-lg">{b.categoryName}</span>
                      {b.exceeded && <Badge variant="exceeded" />}
                      {b.warning && !b.exceeded && <Badge variant="warning" />}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">
                      {MONTH_NAMES[b.month - 1]} {b.year}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(b)}>Delete</Button>
                  </div>
                </div>

                <ProgressBar percentage={b.percentage} />

                <div className="flex justify-between mt-2 text-sm font-bold">
                  <span>Used: <span className={b.exceeded ? 'text-danger' : ''}>{b.usedAmount.toLocaleString()}</span></span>
                  <span>Limit: {b.limitAmount.toLocaleString()}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
