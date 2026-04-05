import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import type { TransactionFilter } from '../../types/transaction'

export default function TransactionListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [filter, setFilter] = useState<TransactionFilter>({ page: 1, limit: 20 })
  const [pendingFilter, setPendingFilter] = useState({
    type: '', categoryId: '', startDate: '', endDate: '',
  })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { transactions, total, page, totalPages, isLoading, isError, deleteTransaction, exportTransactions } =
    useTransactions(filter)
  const { categories } = useCategories()

  function applyFilter() {
    const f: TransactionFilter = { page: 1, limit: 20 }
    if (pendingFilter.type) f.type = pendingFilter.type as 'income' | 'expense'
    if (pendingFilter.categoryId) f.categoryId = Number(pendingFilter.categoryId)
    if (pendingFilter.startDate) f.startDate = pendingFilter.startDate
    if (pendingFilter.endDate) f.endDate = pendingFilter.endDate
    setFilter(f)
  }

  function resetFilter() {
    setPendingFilter({ type: '', categoryId: '', startDate: '', endDate: '' })
    setFilter({ page: 1, limit: 20 })
  }

  async function confirmDelete() {
    if (deleteId === null) return
    try {
      await deleteTransaction.mutateAsync(deleteId)
      toast('Transaction deleted')
    } catch {
      toast('Failed to delete transaction.', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  async function handleExport() {
    try {
      await exportTransactions.mutateAsync({ startDate: filter.startDate, endDate: filter.endDate })
    } catch {
      toast('Failed to export transactions.', 'error')
    }
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Transactions</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} loading={exportTransactions.isPending}>
              Export CSV
            </Button>
            <Button onClick={() => navigate('/transactions/new')}>+ Add Transaction</Button>
          </div>
        </div>

        {/* Delete Confirm Modal */}
        <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Transaction">
          <p className="font-medium mb-4">Delete this transaction? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={confirmDelete} loading={deleteTransaction.isPending}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          </div>
        </Modal>

        {/* Filter bar */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-xs uppercase tracking-wide">Type</label>
              <select
                value={pendingFilter.type}
                onChange={(e) => setPendingFilter((p) => ({ ...p, type: e.target.value }))}
                className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none text-sm"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-xs uppercase tracking-wide">Category</label>
              <select
                value={pendingFilter.categoryId}
                onChange={(e) => setPendingFilter((p) => ({ ...p, categoryId: e.target.value }))}
                className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none text-sm"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-xs uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={pendingFilter.startDate}
                onChange={(e) => setPendingFilter((p) => ({ ...p, startDate: e.target.value }))}
                className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-xs uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={pendingFilter.endDate}
                onChange={(e) => setPendingFilter((p) => ({ ...p, endDate: e.target.value }))}
                className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={applyFilter}>Apply</Button>
              <Button size="sm" variant="outline" onClick={resetFilter}>Reset</Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card padding={false}>
          {isLoading ? (
            <div className="p-8 text-center font-bold text-gray-500">Loading transactions…</div>
          ) : isError ? (
            <div className="p-8 text-center font-bold text-danger">Failed to load transactions.</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center font-bold text-gray-500">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b-2 border-dark bg-gray-neo">
                    <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Category</th>
                    <th className="text-right px-4 py-3 font-black text-sm uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 font-black text-sm uppercase tracking-wide">Description</th>
                    <th className="text-right px-4 py-3 font-black text-sm uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id} className={idx < transactions.length - 1 ? 'border-b-2 border-dark' : ''}>
                      <td className="px-4 py-3 font-medium text-sm">{tx.date}</td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.type === 'income' ? 'income' : 'expense'} />
                      </td>
                      <td className="px-4 py-3 font-medium text-sm">{tx.categoryName}</td>
                      <td className="px-4 py-3 font-bold text-sm text-right">{formatAmount(tx.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{tx.description || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/transactions/${tx.id}/edit`)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteId(tx.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-sm">{total} transaction{total !== 1 ? 's' : ''} total</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
                disabled={(filter.page ?? 1) <= 1}
              >
                Previous
              </Button>
              <span className="font-bold text-sm">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter((f) => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))}
                disabled={(filter.page ?? 1) >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
