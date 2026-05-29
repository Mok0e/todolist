import { apiClient } from '@/lib/apiClient'
import type { Todo, TodoFilters } from '@/types'

export interface CreateTodoRequest {
  title: string
  description?: string | undefined
  categoryId?: string | undefined
  startDate?: string | undefined
  endDate?: string | undefined
}

export interface UpdateTodoRequest {
  title?: string | undefined
  description?: string | null | undefined
  categoryId?: string | undefined
  startDate?: string | null | undefined
  endDate?: string | null | undefined
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
