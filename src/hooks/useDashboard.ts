import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import type { DashboardData } from '../types/dashboard'

export function useDashboard(month?: number, year?: number) {
  const query = useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => dashboardApi.getSummary(month, year),
    select: (res) => {
      const raw = res.data.data as any
      return {
        totalIncome: raw.total_income ?? 0,
        totalExpense: raw.total_expense ?? 0,
        balance: raw.balance ?? 0,
        monthlyData: (raw.monthly_data ?? []).map((m: any) => ({
          month: m.month,
          income: m.income ?? 0,
          expense: m.expense ?? 0,
        })),
        topCategories: (raw.top_categories ?? []).map((c: any) => ({
          categoryId: c.category_id,
          categoryName: c.category_name,
          total: c.total ?? 0,
          percentage: c.percentage ?? 0,
        })),
        budgetStatus: (raw.budget_status ?? []).map((b: any) => ({
          id: b.id,
          categoryId: b.category_id,
          categoryName: b.category_name,
          limitAmount: b.limit_amount,
          usedAmount: b.used_amount,
          percentage: b.percentage,
          warning: b.warning,
          exceeded: b.exceeded,
          month: b.month,
          year: b.year,
        })),
      } as DashboardData
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
