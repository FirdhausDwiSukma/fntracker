export interface Budget {
  id: number
  categoryId: number
  categoryName: string
  limitAmount: number
  usedAmount: number
  percentage: number
  warning: boolean
  exceeded: boolean
  month: number
  year: number
}

export interface BudgetRequest {
  categoryId: number
  limitAmount: number
  month: number
  year: number
}
