import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../../hooks/useCategories'
import type { Category } from '../../types/category'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
})

type CategoryFormValues = z.infer<typeof categorySchema>

type FormMode = 'add' | 'edit'

export default function CategoryPage() {
  const { categories, isLoading, isError, createCategory, updateCategory, deleteCategory } =
    useCategories()

  const [formMode, setFormMode] = useState<FormMode>('add')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', type: 'expense' },
  })

  function openAdd() {
    setFormMode('add')
    setEditingId(null)
    reset({ name: '', type: 'expense' })
    setShowForm(true)
    setErrorMsg(null)
  }

  function openEdit(cat: Category) {
    setFormMode('edit')
    setEditingId(cat.id)
    reset({ name: cat.name, type: cat.type })
    setShowForm(true)
    setErrorMsg(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    reset({ name: '', type: 'expense' })
    setErrorMsg(null)
  }

  function notify(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  async function onSubmit(values: CategoryFormValues) {
    setErrorMsg(null)
    try {
      if (formMode === 'add') {
        await createCategory.mutateAsync(values)
        notify('Category created successfully')
      } else if (editingId !== null) {
        await updateCategory.mutateAsync({ id: editingId, data: values })
        notify('Category updated successfully')
      }
      closeForm()
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  async function handleDelete(cat: Category) {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return
    try {
      await deleteCategory.mutateAsync(cat.id)
      notify('Category deleted')
    } catch {
      setErrorMsg('Failed to delete category.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Categories</h1>
          <button
            onClick={openAdd}
            className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            + Add Category
          </button>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="mb-4 bg-[#22C55E] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-bold text-white">
            {successMsg}
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-4 bg-[#EF4444] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-3 font-bold text-white">
            {errorMsg}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-5">
            <h2 className="text-lg font-black mb-4">
              {formMode === 'add' ? 'Add Category' : 'Edit Category'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block font-bold text-sm mb-1">Name</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Groceries"
                  className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000]"
                />
                {errors.name && (
                  <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.name.message}</p>
                )}
              </div>

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

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-5 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving…' : formMode === 'add' ? 'Create' : 'Save Changes'}
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

        {/* Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
          {isLoading ? (
            <div className="p-8 text-center font-bold text-gray-500">Loading categories…</div>
          ) : isError ? (
            <div className="p-8 text-center font-bold text-[#EF4444]">
              Failed to load categories.
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center font-bold text-gray-500">
              No categories yet. Add one above.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-[#F5F5F5]">
                  <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 font-black text-sm uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={idx < categories.length - 1 ? 'border-b-2 border-black' : ''}
                  >
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3">
                      {cat.type === 'income' ? (
                        <span className="inline-block bg-[#22C55E] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Income
                        </span>
                      ) : (
                        <span className="inline-block bg-[#EF4444] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Expense
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deleteCategory.isPending}
                          className="bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
