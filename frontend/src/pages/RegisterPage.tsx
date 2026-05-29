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

const registerSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자 이하여야 합니다.')
    .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      const { email, password } = getValues()
      try {
        const loginData = await authApi.login({ email, password })
        setToken(loginData.accessToken, '')
        void navigate('/todos')
      } catch {
        void navigate('/login')
      }
    },
    onError: (error: ApiErrorData) => {
      if (error.code === 'AUTH_EMAIL_DUPLICATE') {
        setError('email', { message: '이미 사용 중인 이메일입니다.' })
      } else {
        setError('root', { message: error.message })
      }
    },
  })

  const onSubmit = (values: RegisterFormValues) => {
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

  const { ref: nameRef, ...nameRest } = register('name')
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
          label="이름"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...nameRest}
          ref={nameRef}
        />
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
          autoComplete="new-password"
          hint="영문자와 숫자를 포함하여 8자 이상"
          error={errors.password?.message}
          {...passwordRest}
          ref={passwordRef}
        />
        <Button type="submit" fullWidth loading={isPending}>
          회원가입
        </Button>
      </form>
      <p style={footerStyle}>
        이미 계정이 있으신가요?
        <Link to="/login" style={linkStyle}>
          로그인
        </Link>
      </p>
    </AuthCard>
  )
}
