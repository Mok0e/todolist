import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ListTodo, Tag, Settings, User, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

const sidebarItems = [
  { to: '/todos', icon: <ListTodo size={18} />, label: '할 일' },
  { to: '/calendar', icon: <Calendar size={18} />, label: '캘린더' },
  { to: '/categories', icon: <Tag size={18} />, label: '카테고리' },
  { to: '/settings', icon: <Settings size={18} />, label: '설정' },
]

const tabItems = [
  { to: '/todos', icon: <ListTodo size={22} />, label: '할 일' },
  { to: '/calendar', icon: <Calendar size={22} />, label: '캘린더' },
  { to: '/categories', icon: <Tag size={22} />, label: '카테고리' },
  { to: '/settings', icon: <Settings size={22} />, label: '설정' },
  { to: '/profile', icon: <User size={22} />, label: '프로필' },
]

export function AppLayout() {
  const isDesktop = useIsDesktop()
  const clearToken = useAuthStore((s) => s.clearToken)
  const navigate = useNavigate()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const handleLogout = () => {
    clearToken()
    void navigate('/login')
  }

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh' }}>
        {/* Sidebar */}
        <nav
          style={{
            width: '220px',
            flexShrink: 0,
            borderRight: '1px solid var(--separator)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 12px',
            gap: '4px',
            position: 'sticky',
            top: 0,
            height: '100dvh',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.3px',
              color: 'var(--text-primary)',
              padding: '0 12px',
              marginBottom: '20px',
            }}
          >
            TodoList
          </div>

          {sidebarItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div
                  onMouseEnter={() => setHoveredItem(to)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive
                      ? 'var(--fill-tinted)'
                      : hoveredItem === to
                        ? 'var(--fill-secondary)'
                        : 'transparent',
                    color: isActive ? 'var(--color-blue)' : 'var(--text-secondary)',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'background 150ms ease, color 150ms ease',
                  }}
                >
                  {icon}
                  {label}
                </div>
              )}
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          <div style={{ borderTop: '1px solid var(--separator)', marginBottom: '8px' }} />

          <NavLink to="/profile" style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                onMouseEnter={() => setHoveredItem('/profile')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive
                    ? 'var(--fill-tinted)'
                    : hoveredItem === '/profile'
                      ? 'var(--fill-secondary)'
                      : 'transparent',
                  color: isActive ? 'var(--color-blue)' : 'var(--text-secondary)',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 150ms ease, color 150ms ease',
                }}
              >
                <User size={18} />
                프로필
              </div>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              color: 'var(--color-red)',
              fontSize: '15px',
              fontWeight: 400,
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              minHeight: 'unset',
              minWidth: 'unset',
            }}
          >
            로그아웃
          </button>
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-grouped)' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  // Mobile layout
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <main style={{ flex: 1, paddingBottom: '60px', background: 'var(--bg-grouped)' }}>
        <Outlet />
      </main>

      {/* TabBar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--separator)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {tabItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '4px 0',
                  color: isActive ? 'var(--color-blue)' : 'var(--color-gray)',
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 150ms ease',
                }}
              >
                {icon}
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
