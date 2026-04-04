import axiosInstance from './axiosInstance'
import type { LoginRequest, RegisterRequest, User } from '../types/auth'

interface ApiResponse<T> {
  data: T
  message: string
}

export const authApi = {
  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<User>>('/auth/register', data),
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<User>>('/auth/login', data),
  logout: () =>
    axiosInstance.post<ApiResponse<null>>('/auth/logout'),
}
