import { apiClient } from '@/lib/apiClient'
import type { Todo } from '@/types'

export const calendarApi = {
  list: (dueDateFrom: string, dueDateTo: string) =>
    apiClient.get<Todo[]>('/todos', { params: { dueDateFrom, dueDateTo } }),
}
