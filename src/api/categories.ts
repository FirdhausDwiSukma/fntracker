import axiosInstance from './axiosInstance'
import type { Category, CategoryRequest } from '../types/category'

interface ApiResponse<T> {
  data: T
  message: string
}

export const getCategories = () =>
  axiosInstance.get<ApiResponse<Category[]>>('/categories').then((r) => r.data.data)

export const createCategory = (data: CategoryRequest) =>
  axiosInstance.post<ApiResponse<Category>>('/categories', data).then((r) => r.data.data)

export const updateCategory = (id: number, data: CategoryRequest) =>
  axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, data).then((r) => r.data.data)

export const deleteCategory = (id: number) =>
  axiosInstance.delete<ApiResponse<null>>(`/categories/${id}`)
