import axiosInstance from './axiosInstance'
import type { Budget } from '../types/budget'

interface ApiResponse<T> {
  data: T
  message: string
}

// Raw shape returned by the Go backend (snake_case)
interface BudgetRaw {
  id: number
  category_id: number
  category_name: string
  limit_amount: number
  used_amount: number
  percentage: number
  warning: boolean
  exceeded: boolean
  month: number
  year: number
}

interface BudgetRequestRaw {
  category_id: number
  limit_amount: number
  month: number
  year: number
}

function mapBudget(raw: BudgetRaw): Budget {
  return {
    id: raw.id,
    categoryId: raw.category_id,
    categoryName: raw.category_name,
    limitAmount: raw.limit_amount,
    usedAmount: raw.used_amount,
    percentage: raw.percentage,
    warning: raw.warning,
    exceeded: raw.exceeded,
    month: raw.month,
    year: raw.year,
  }
}

export const getBudgets = (month?: number, year?: number): Promise<Budget[]> => {
  const params: Record<string, number | undefined> = {}
  if (month) params.month = month
  if (year) params.year = year
  return axiosInstance
    .get<ApiResponse<BudgetRaw[]>>('/budgets', { params })
    .then((r) => (r.data.data ?? []).map(mapBudget))
}

export const createBudget = (data: BudgetRequestRaw): Promise<Budget> =>
  axiosInstance
    .post<ApiResponse<BudgetRaw>>('/budgets', data)
    .then((r) => mapBudget(r.data.data))

export const updateBudget = (id: number, data: BudgetRequestRaw): Promise<Budget> =>
  axiosInstance
    .put<ApiResponse<BudgetRaw>>(`/budgets/${id}`, data)
    .then((r) => mapBudget(r.data.data))

export const deleteBudget = (id: number): Promise<void> =>
  axiosInstance.delete<ApiResponse<null>>(`/budgets/${id}`).then(() => undefined)
