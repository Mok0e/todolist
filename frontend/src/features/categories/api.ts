import { apiClient } from '@/lib/apiClient'
import type { Category } from '@/types'

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  name: string
}

export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>('/categories'),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<Category>('/categories', body),

  update: (id: string, body: UpdateCategoryRequest) =>
    apiClient.patch<Category>(`/categories/${id}`, body),

  remove: (id: string) =>
    apiClient.delete<Record<string, never>>(`/categories/${id}`),
}
