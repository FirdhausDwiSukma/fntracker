import { Budget } from './budget'

export interface MonthlyAggregate {
  month: string
  income: number
  expense: number
}

export interface CategoryExpense {
  categoryId: number
  categoryName: string
  total: number
  percentage: number
}

export interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyData: MonthlyAggregate[]
  topCategories: CategoryExpense[]
  budgetStatus: Budget[]
}
