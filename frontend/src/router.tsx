import { useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api'
import { queryKeys } from '@/lib/queryKeys'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { TodosPage } from '@/pages/TodosPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { AppLayout } from '@/components/layout/AppLayout'

function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: user } = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: authApi.getMe,
    enabled: !!accessToken,
  })

  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute('data-theme', user.theme)
    }
  }, [user?.theme])

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnlyRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <Navigate to="/todos" replace /> : <Outlet />
}

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/todos', element: <TodosPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/calendar', element: <CalendarPage /> },

          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/todos" replace /> },
  { path: '*', element: <Navigate to="/todos" replace /> },
])

export default router
