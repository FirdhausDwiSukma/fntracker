import axiosInstance from './axiosInstance'
import type { Transaction, TransactionFilter, TransactionListResponse } from '../types/transaction'

interface ApiResponse<T> {
  data: T
  message: string
}

interface TransactionRequest {
  category_id: number
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: string // YYYY-MM-DD
}

export const getTransactions = (filter: TransactionFilter): Promise<TransactionListResponse> => {
  const params: Record<string, string | number | undefined> = {}
  if (filter.type) params.type = filter.type
  if (filter.categoryId) params.category_id = filter.categoryId
  if (filter.startDate) params.start_date = filter.startDate
  if (filter.endDate) params.end_date = filter.endDate
  if (filter.month) params.month = filter.month
  if (filter.year) params.year = filter.year
  if (filter.page) params.page = filter.page
  if (filter.limit) params.limit = filter.limit

  return axiosInstance
    .get<TransactionListResponse>('/transactions', { params })
    .then((r) => r.data)
}

export const createTransaction = (data: TransactionRequest): Promise<Transaction> =>
  axiosInstance
    .post<ApiResponse<Transaction>>('/transactions', data)
    .then((r) => r.data.data)

export const updateTransaction = (id: number, data: TransactionRequest): Promise<Transaction> =>
  axiosInstance
    .put<ApiResponse<Transaction>>(`/transactions/${id}`, data)
    .then((r) => r.data.data)

export const deleteTransaction = (id: number): Promise<void> =>
  axiosInstance.delete<ApiResponse<null>>(`/transactions/${id}`).then(() => undefined)

export const exportTransactions = (startDate?: string, endDate?: string): Promise<void> => {
  const params: Record<string, string | undefined> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  return axiosInstance
    .get('/transactions/export', { params, responseType: 'blob' })
    .then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'transactions.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
}
