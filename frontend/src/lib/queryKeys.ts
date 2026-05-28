import type { TodoFilters } from '@/types'

export const queryKeys = {
  user: {
    me: () => ['user', 'me'] as const,
  },
  todos: {
    all: ['todos'] as const,
    list: (filters?: TodoFilters) => ['todos', 'list', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => ['categories', 'list'] as const,
  },
} as const
