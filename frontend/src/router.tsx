import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

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
      { path: '/login', element: <div>Login</div> },
      { path: '/register', element: <div>Register</div> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/todos', element: <div>Todos</div> },
      { path: '/categories', element: <div>Categories</div> },
      { path: '/settings', element: <div>Settings</div> },
      { path: '/calendar', element: <div>Calendar</div> },
    ],
  },
  { path: '/', element: <Navigate to="/todos" replace /> },
  { path: '*', element: <Navigate to="/todos" replace /> },
])

export default router
