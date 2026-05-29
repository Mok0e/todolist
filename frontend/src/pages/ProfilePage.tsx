import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ProfileForm } from '@/features/auth/ProfileForm'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/features/auth/api'
import { queryKeys } from '@/lib/queryKeys'

export function ProfilePage() {
  const navigate = useNavigate()
  const clearToken = useAuthStore((s) => s.clearToken)

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: authApi.getMe,
  })

  const handleLogout = () => {
    clearToken()
    void navigate('/login')
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    padding: 'var(--spacing-xl) var(--spacing-md)',
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-xl)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>프로필</h1>
          <Button type="button" variant="tint" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
        {isLoading && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            로딩 중...
          </p>
        )}
        {user && <ProfileForm user={user} />}
      </div>
    </div>
  )
}
