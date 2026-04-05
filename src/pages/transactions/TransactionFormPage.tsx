import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { getTransactions } from '../../api/transactions'

const transactionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Amount must be a number' }).gt(0, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  category_id: z.coerce.number({ invalid_type_error: 'Category is required' }).gt(0, 'Category is required'),
  date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export default function TransactionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { createTransaction, updateTransaction } = useTransactions()
  const { categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: undefined,
      type: 'expense',
      category_id: undefined,
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  })

  const selectedType = watch('type')

  // Fetch existing transaction in edit mode
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransactions({ page: 1, limit: 1 }).then((r) => r.data.find((t) => t.id === Number(id))),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingData) {
      reset({
        amount: existingData.amount,
        type: existingData.type,
        category_id: existingData.categoryId,
        date: existingData.date,
        description: existingData.description ?? '',
      })
    }
  }, [existingData, reset])

  // When type changes, reset category_id
  useEffect(() => {
    setValue('category_id', 0 as unknown as number)
  }, [selectedType, setValue])

  const filteredCategories = categories.filter((c) => c.type === selectedType)

  async function onSubmit(values: TransactionFormValues) {
    const payload = {
      category_id: values.category_id,
      amount: values.amount,
      type: values.type,
      date: values.date,
      description: values.description || undefined,
    }

    try {
      if (isEdit && id) {
        await updateTransaction.mutateAsync({ id: Number(id), data: payload })
      } else {
        await createTransaction.mutateAsync(payload)
      }
      navigate('/transactions')
    } catch {
      // error handled below via mutation state
    }
  }

  const mutationError = isEdit ? updateTransaction.isError : createTransaction.isError

  if (isEdit && isLoadingExisting) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6 flex items-center justify-center">
        <p className="font-bold text-gray-500">Loading transaction…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
        </div>

        {/* Error banner */}
        {mutationError && (
          <div className="mb-4 bg-[#EF4444] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-bold text-white">
            Something went wrong. Please try again.
          </div>
        )}

        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Amount */}
            <div>
              <label className="block font-bold text-sm mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount')}
                placeholder="e.g. 50000"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000]"
              />
              {errors.amount && (
                <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block font-bold text-sm mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000]"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {errors.type && (
                <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-sm mb-1">Category</label>
              <select
                {...register('category_id')}
                className="w-full border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000]"
              >
                <option value="">Select a category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.category_id.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block font-bold text-sm mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000]"
              />
              {errors.date && (
                <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-sm mb-1">
                Description <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="e.g. Lunch at restaurant"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000] resize-none"
              />
              {errors.description && (
                <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
