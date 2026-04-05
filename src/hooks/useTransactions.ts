import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} from '../api/transactions'
import type { TransactionFilter } from '../types/transaction'

interface TransactionRequest {
  category_id: number
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: string
}

export function useTransactions(filter: TransactionFilter = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => getTransactions(filter),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['transactions'] })

  const createMutation = useMutation({
    mutationFn: (data: TransactionRequest) => createTransaction(data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionRequest }) =>
      updateTransaction(id, data),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: invalidate,
  })

  const exportMutation = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate?: string; endDate?: string }) =>
      exportTransactions(startDate, endDate),
  })

  return {
    transactions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    totalPages: query.data?.total_pages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    createTransaction: createMutation,
    updateTransaction: updateMutation,
    deleteTransaction: deleteMutation,
    exportTransactions: exportMutation,
  }
}
