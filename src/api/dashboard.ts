import axiosInstance from './axiosInstance'
import type { DashboardData } from '../types/dashboard'

export const dashboardApi = {
  getSummary: (month?: number, year?: number) =>
    axiosInstance.get<{ data: DashboardData }>('/dashboard', {
      params: { month, year },
    }),
}
