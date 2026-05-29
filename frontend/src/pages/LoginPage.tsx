import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { AuthCard } from '@/components/layout/AuthCard'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiErrorData } from '@/lib/apiClient'

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: LoginFormValues) => authApi.login(variables),
    onSuccess: (data) => {
      setToken(data.accessToken, '')
      void navigate('/todos')
    },
    onError: (error: ApiErrorData) => {
      if (error.code === 'AUTH_INVALID_CREDENTIALS') {
        setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
      } else {
        setError('root', { message: error.message })
      }
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    mutate(values)
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  }

  const errorBoxStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'rgba(255, 59, 48, 0.08)',
    border: '1px solid var(--color-red)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-red)',
    fontSize: '15px',
  }

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 'var(--spacing-md)',
    fontSize: '15px',
    color: 'var(--text-secondary)',
  }

  const linkStyle: React.CSSProperties = {
    color: 'var(--text-tint)',
    textDecoration: 'none',
    marginLeft: '4px',
    fontWeight: 500,
  }

  const { ref: emailRef, ...emailRest } = register('email')
  const { ref: passwordRef, ...passwordRest } = register('password')

  return (
    <AuthCard title="TodoList">
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={formStyle}>
        {errors.root?.message && (
          <div style={errorBoxStyle} role="alert">
            {errors.root.message}
          </div>
        )}
        <FloatingLabelInput
          label="이메일"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...emailRest}
          ref={emailRef}
        />
        <FloatingLabelInput
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...passwordRest}
          ref={passwordRef}
        />
        <Button type="submit" fullWidth loading={isPending}>
          로그인
        </Button>
      </form>
      <p style={footerStyle}>
        계정이 없으신가요?
        <Link to="/register" style={linkStyle}>
          회원가입
        </Link>
      </p>
    </AuthCard>
  )
}
