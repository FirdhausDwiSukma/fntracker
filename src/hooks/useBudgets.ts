import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets'

interface BudgetMutationData {
  category_id: number
  limit_amount: number
  month: number
  year: number
}

export function useBudgets(month?: number, year?: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => getBudgets(month, year),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['budgets'] })

  const createMutation = useMutation({
    mutationFn: (data: BudgetMutationData) => createBudget(data),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetMutationData }) =>
      updateBudget(id, data),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBudget(id),
    onSuccess: invalidate,
  })

  return {
    budgets: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createBudget: createMutation,
    updateBudget: updateMutation,
    deleteBudget: deleteMutation,
  }
}
