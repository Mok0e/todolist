export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'OVERDUE' | 'DONE';
export type Theme = 'LIGHT' | 'DARK';
export type Language = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  startDate: string | null;
  endDate: string | null;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface TodoFilters {
  status?: TodoStatus
  categoryId?: string
  dueDateFrom?: string
  dueDateTo?: string
}
