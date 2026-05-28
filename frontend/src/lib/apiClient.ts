import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export interface ApiErrorData {
  code: string
  message: string
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearToken()
      window.location.href = '/login'
    }
    const errorData: ApiErrorData = error.response?.data?.error ?? {
      code: 'NETWORK_ERROR',
      message: (error as Error).message ?? 'Network error',
    }
    return Promise.reject(errorData)
  }
)

type AxiosConfig = Parameters<typeof instance.get>[1]
type AxiosPostConfig = Parameters<typeof instance.post>[2]

export const apiClient = instance as unknown as {
  get<T>(url: string, config?: AxiosConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: AxiosPostConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: AxiosPostConfig): Promise<T>
  delete<T>(url: string, config?: AxiosConfig): Promise<T>
}
