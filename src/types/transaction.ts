export interface Transaction {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
}

export interface TransactionFilter {
  type?: 'income' | 'expense'
  categoryId?: number
  startDate?: string
  endDate?: string
  month?: number
  year?: number
  page?: number
  limit?: number
}

export interface TransactionListResponse {
  data: Transaction[]
  total: number
  page: number
  limit: number
  total_pages: number
}
