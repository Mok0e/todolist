import { apiClient } from '@/lib/apiClient'
import type { User } from '@/types'

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RegisterResponse {
  id: string
  email: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface UpdateProfileRequest {
  name?: string
  currentPassword?: string
  newPassword?: string
}

export const authApi = {
  register: (body: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/auth/register', body),

  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', body),

  getMe: () =>
    apiClient.get<User>('/users/me'),

  updateProfile: (body: UpdateProfileRequest) =>
    apiClient.patch<User>('/users/me', body),

  deleteAccount: () =>
    apiClient.delete<Record<string, never>>('/users/me'),
}
