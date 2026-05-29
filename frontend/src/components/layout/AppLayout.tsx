import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ListTodo, Tag, Settings, User, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from 'react-i18next'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

export function AppLayout() {
  const isDesktop = useIsDesktop()
  const clearToken = useAuthStore((s) => s.clearToken)
  const navigate = useNavigate()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [logoutHovered, setLogoutHovered] = useState(false)
  const { t } = useTranslation()

  const sidebarItems = [
    { to: '/todos', icon: <ListTodo size={18} />, label: t('todos.title') },
    { to: '/calendar', icon: <Calendar size={18} />, label: t('calendar.title') },
    { to: '/categories', icon: <Tag size={18} />, label: t('categories.title') },
    { to: '/settings', icon: <Settings size={18} />, label: t('settings.title') },
  ]

  const tabItems = [
    { to: '/todos', icon: <ListTodo size={22} />, label: t('todos.title') },
    { to: '/calendar', icon: <Calendar size={22} />, label: t('calendar.title') },
    { to: '/categories', icon: <Tag size={22} />, label: t('categories.title') },
    { to: '/settings', icon: <Settings size={22} />, label: t('settings.title') },
    { to: '/profile', icon: <User size={22} />, label: t('profile.title') },
  ]

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
            {t('common.appName')}
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
                    padding: `var(--spacing-xs) var(--spacing-sm)`,
                    borderRadius: 'var(--radius-md)',
                    background: isActive
                      ? 'var(--bg-tertiary)'
                      : hoveredItem === to
                        ? 'var(--separator)'
                        : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ 
                    color: 'var(--text-primary)', 
                    opacity: isActive ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {icon}
                  </div>
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
                  gap: 'var(--spacing-sm)',
                  padding: `var(--spacing-xs) var(--spacing-sm)`,
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'var(--bg-tertiary)'
                    : hoveredItem === '/profile'
                      ? 'var(--separator)'
                      : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{ 
                  color: 'var(--text-primary)', 
                  opacity: isActive ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={18} />
                </div>
                {t('profile.title')}
              </div>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: `var(--spacing-xs) var(--spacing-sm)`,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: logoutHovered ? 'var(--color-red)' : 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: 400,
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              minHeight: 'unset',
              minWidth: 'unset',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {t('auth.logout')}
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
                  gap: 'var(--spacing-xs)',
                  padding: `var(--spacing-xs) 0`,
                  color: isActive ? 'var(--text-tint)' : 'var(--text-secondary)',
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
