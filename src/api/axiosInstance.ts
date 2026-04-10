import axios from 'axios'

function getCsrfToken(): string {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : ''
}

const baseURL = import.meta.env.VITE_API_BASE_URL
if (!baseURL && import.meta.env.PROD) {
  console.error('VITE_API_BASE_URL is not set. API calls will fail in production.')
}

const axiosInstance = axios.create({
  baseURL: baseURL || 'http://localhost:8080/api',
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase()
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method ?? '')) {
    config.headers['X-CSRF-Token'] = getCsrfToken()
  }
  return config
})

export default axiosInstance
