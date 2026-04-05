import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../../hooks/useCategories'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import type { Category } from '../../types/category'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoryPage() {
  const { categories, isLoading, isError, createCategory, updateCategory, deleteCategory } =
    useCategories()
  const { toast } = useToast()

  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

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
  }

  function openEdit(cat: Category) {
    setFormMode('edit')
    setEditingId(cat.id)
    reset({ name: cat.name, type: cat.type })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    reset({ name: '', type: 'expense' })
  }

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (formMode === 'add') {
        await createCategory.mutateAsync(values)
        toast('Category created successfully')
      } else if (editingId !== null) {
        await updateCategory.mutateAsync({ id: editingId, data: values })
        toast('Category updated successfully')
      }
      closeForm()
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteCategory.mutateAsync(deleteTarget.id)
      toast('Category deleted')
    } catch {
      toast('Failed to delete category.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Categories</h1>
          <Button onClick={openAdd}>+ Add Category</Button>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          open={showForm}
          onClose={closeForm}
          title={formMode === 'add' ? 'Add Category' : 'Edit Category'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Name"
              placeholder="e.g. Groceries"
              error={errors.name?.message}
              {...register('name')}
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
              {errors.type && (
                <p className="text-danger text-sm font-bold">{errors.type.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={isSubmitting}>
                {formMode === 'add' ? 'Create' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Delete Category"
        >
          <p className="font-medium mb-4">
            Delete category <strong>"{deleteTarget?.name}"</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={confirmDelete} loading={deleteCategory.isPending}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
          </div>
        </Modal>

        {/* Table */}
        <Card padding={false}>
          {isLoading ? (
            <div className="p-8 text-center font-bold text-gray-500">Loading categories…</div>
          ) : isError ? (
            <div className="p-8 text-center font-bold text-danger">Failed to load categories.</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center font-bold text-gray-500">
              No categories yet. Add one above.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-dark bg-gray-neo">
                  <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Type</th>
                  <th className="text-right px-4 py-3 font-black text-sm uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className={idx < categories.length - 1 ? 'border-b-2 border-dark' : ''}>
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.type === 'income' ? 'income' : 'expense'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(cat)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
