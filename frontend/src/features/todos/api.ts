import { apiClient } from '@/lib/apiClient'
import type { Todo, TodoFilters } from '@/types'

export interface CreateTodoRequest {
  title: string
  description?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}

export interface UpdateTodoRequest {
  title?: string
  description?: string | null
  categoryId?: string
  startDate?: string | null
  endDate?: string | null
}

export const todosApi = {
  list: (filters?: TodoFilters) =>
    apiClient.get<Todo[]>('/todos', { params: filters }),

  create: (body: CreateTodoRequest) =>
    apiClient.post<Todo>('/todos', body),

  update: (id: string, body: UpdateTodoRequest) =>
    apiClient.patch<Todo>(`/todos/${id}`, body),

  remove: (id: string) =>
    apiClient.delete<Record<string, never>>(`/todos/${id}`),

  complete: (id: string) =>
    apiClient.patch<Todo>(`/todos/${id}/complete`),

  incomplete: (id: string) =>
    apiClient.patch<Todo>(`/todos/${id}/incomplete`),
}
