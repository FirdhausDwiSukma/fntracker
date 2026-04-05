import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { getTransactions } from '../../api/transactions'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const transactionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Amount must be a number' }).gt(0, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  category_id: z.coerce.number({ invalid_type_error: 'Category is required' }).gt(0, 'Category is required'),
  date: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
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
      // error shown via mutation state below
    }
  }

  const mutationError = isEdit ? updateTransaction.isError : createTransaction.isError

  if (isEdit && isLoadingExisting) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="font-bold text-gray-500">Loading transaction…</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
        </div>

        {mutationError && (
          <div className="mb-4 bg-danger border-neo-thick border-dark shadow-neo px-4 py-3 font-bold text-light">
            Something went wrong. Please try again.
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 50000"
              error={errors.amount?.message}
              {...register('amount')}
            />

            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Type</label>
              <select
                {...register('type')}
                className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none focus:shadow-neo"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {errors.type && <p className="text-danger text-sm font-bold">{errors.type.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Category</label>
              <select
                {...register('category_id')}
                className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none focus:shadow-neo"
              >
                <option value="">Select a category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-danger text-sm font-bold">{errors.category_id.message}</p>}
            </div>

            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />

            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">
                Description <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="e.g. Lunch at restaurant"
                className="w-full border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none focus:shadow-neo resize-none"
              />
              {errors.description && <p className="text-danger text-sm font-bold">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? 'Save Changes' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
