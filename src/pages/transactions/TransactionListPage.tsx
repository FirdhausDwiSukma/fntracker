import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import type { TransactionFilter } from '../../types/transaction'

export default function TransactionListPage() {
  const navigate = useNavigate()

  const [filter, setFilter] = useState<TransactionFilter>({ page: 1, limit: 20 })
  const [pendingFilter, setPendingFilter] = useState<{
    type: string
    categoryId: string
    startDate: string
    endDate: string
  }>({ type: '', categoryId: '', startDate: '', endDate: '' })

  const { transactions, total, page, totalPages, isLoading, isError, deleteTransaction, exportTransactions } =
    useTransactions(filter)
  const { categories } = useCategories()

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function notify(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  function applyFilter() {
    const newFilter: TransactionFilter = { page: 1, limit: 20 }
    if (pendingFilter.type) newFilter.type = pendingFilter.type as 'income' | 'expense'
    if (pendingFilter.categoryId) newFilter.categoryId = Number(pendingFilter.categoryId)
    if (pendingFilter.startDate) newFilter.startDate = pendingFilter.startDate
    if (pendingFilter.endDate) newFilter.endDate = pendingFilter.endDate
    setFilter(newFilter)
  }

  function resetFilter() {
    setPendingFilter({ type: '', categoryId: '', startDate: '', endDate: '' })
    setFilter({ page: 1, limit: 20 })
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return
    try {
      await deleteTransaction.mutateAsync(id)
      notify('Transaction deleted')
    } catch {
      setErrorMsg('Failed to delete transaction.')
      setTimeout(() => setErrorMsg(null), 3000)
    }
  }

  async function handleExport() {
    try {
      await exportTransactions.mutateAsync({
        startDate: filter.startDate,
        endDate: filter.endDate,
      })
    } catch {
      setErrorMsg('Failed to export transactions.')
      setTimeout(() => setErrorMsg(null), 3000)
    }
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Transactions</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exportTransactions.isPending}
              className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50"
            >
              {exportTransactions.isPending ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              onClick={() => navigate('/transactions/new')}
              className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              + Add Transaction
            </button>
          </div>
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

        {/* Filter bar */}
        <div className="mb-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block font-bold text-xs mb-1 uppercase tracking-wide">Type</label>
              <select
                value={pendingFilter.type}
                onChange={(e) => setPendingFilter((p) => ({ ...p, type: e.target.value }))}
                className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000] text-sm"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-xs mb-1 uppercase tracking-wide">Category</label>
              <select
                value={pendingFilter.categoryId}
                onChange={(e) => setPendingFilter((p) => ({ ...p, categoryId: e.target.value }))}
                className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000] text-sm"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-xs mb-1 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={pendingFilter.startDate}
                onChange={(e) => setPendingFilter((p) => ({ ...p, startDate: e.target.value }))}
                className="border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000] text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-xs mb-1 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={pendingFilter.endDate}
                onChange={(e) => setPendingFilter((p) => ({ ...p, endDate: e.target.value }))}
                className="border-2 border-black px-3 py-2 font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000] text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyFilter}
                className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
              >
                Apply
              </button>
              <button
                onClick={resetFilter}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
          {isLoading ? (
            <div className="p-8 text-center font-bold text-gray-500">Loading transactions…</div>
          ) : isError ? (
            <div className="p-8 text-center font-bold text-[#EF4444]">Failed to load transactions.</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center font-bold text-gray-500">No transactions found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-[#F5F5F5]">
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
                  <tr
                    key={tx.id}
                    className={idx < transactions.length - 1 ? 'border-b-2 border-black' : ''}
                  >
                    <td className="px-4 py-3 font-medium text-sm">{tx.date}</td>
                    <td className="px-4 py-3">
                      {tx.type === 'income' ? (
                        <span className="inline-block bg-[#22C55E] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Income
                        </span>
                      ) : (
                        <span className="inline-block bg-[#EF4444] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                          Expense
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-sm">{tx.categoryName}</td>
                    <td className="px-4 py-3 font-bold text-sm text-right">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                      {tx.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                          className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleteTransaction.isPending}
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

        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-sm">
              {total} transaction{total !== 1 ? 's' : ''} total
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilter((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
                disabled={(filter.page ?? 1) <= 1}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#000]"
              >
                Previous
              </button>
              <span className="font-bold text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setFilter((f) => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))}
                disabled={(filter.page ?? 1) >= totalPages}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#000]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
