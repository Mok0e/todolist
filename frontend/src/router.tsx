import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <div>Login</div>,
  },
  {
    path: '/register',
    element: <div>Register</div>,
  },
  {
    path: '/todos',
    element: <div>Todos</div>,
  },
  {
    path: '/categories',
    element: <div>Categories</div>,
  },
  {
    path: '/settings',
    element: <div>Settings</div>,
  },
  {
    path: '/calendar',
    element: <div>Calendar</div>,
  },
  {
    path: '/',
    element: <div>Root</div>,
  },
])

export default router
