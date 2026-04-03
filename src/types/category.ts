export interface Category {
  id: number
  userId: number
  name: string
  type: 'income' | 'expense'
}

export interface CategoryRequest {
  name: string
  type: 'income' | 'expense'
}
