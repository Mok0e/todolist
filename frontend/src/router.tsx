import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { TodosPage } from '@/pages/TodosPage'

function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
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
      { path: '/todos', element: <TodosPage /> },
      { path: '/categories', element: <div>Categories</div> },
      { path: '/settings', element: <div>Settings</div> },
      { path: '/calendar', element: <div>Calendar</div> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '/', element: <Navigate to="/todos" replace /> },
  { path: '*', element: <Navigate to="/todos" replace /> },
])

export default router
