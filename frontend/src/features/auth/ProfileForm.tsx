import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiErrorData } from '@/lib/apiClient'
import type { User } from '@/types'

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 50자 이하여야 합니다.'),
  currentPassword: z.string(),
  newPassword: z.string().refine(
    (val) => val === '' || (val.length >= 8 && val.length <= 128 && /[a-zA-Z]/.test(val) && /[0-9]/.test(val)),
    '비밀번호는 8자 이상이어야 하며 영문자와 숫자를 포함해야 합니다.'
  ),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const navigate = useNavigate()
  const clearToken = useAuthStore((s) => s.clearToken)
  const queryClient = useQueryClient()
  const emailInputId = useId()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      currentPassword: '',
      newPassword: '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      const body: Parameters<typeof authApi.updateProfile>[0] = {
        name: values.name,
      }
      if (values.currentPassword !== '') body.currentPassword = values.currentPassword
      if (values.newPassword !== '') body.newPassword = values.newPassword
      return authApi.updateProfile(body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.me() })
    },
    onError: (error: ApiErrorData) => {
      if (error.code === 'AUTH_PASSWORD_MISMATCH') {
        setError('currentPassword', {
          message: '현재 비밀번호가 올바르지 않습니다.',
        })
      } else {
        setError('root', { message: error.message })
      }
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      clearToken()
      void navigate('/login')
    },
  })

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      deleteAccountMutation.mutate()
    }
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  }

  const readOnlyInputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    padding: '0 16px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '17px',
    fontFamily: 'var(--font-text)',
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'not-allowed',
  }

  const separatorStyle: React.CSSProperties = {
    height: '1px',
    background: 'var(--separator)',
    margin: 'var(--spacing-xl) 0',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 'var(--spacing-md)',
    fontFamily: 'var(--font-text)',
  }

  const errorBoxStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'rgba(255, 59, 48, 0.08)',
    border: '1px solid var(--color-red)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-red)',
    fontSize: '15px',
  }

  const { ref: nameRef, ...nameRest } = register('name')
  const { ref: currentPasswordRef, ...currentPasswordRest } = register('currentPassword')
  const { ref: newPasswordRef, ...newPasswordRest } = register('newPassword')

  return (
    <div>
      <form
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        noValidate
        style={formStyle}
      >
        {errors.root?.message && (
          <div style={errorBoxStyle} role="alert">
            {errors.root.message}
          </div>
        )}

        {/* 이름 */}
        <FloatingLabelInput
          label="이름"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...nameRest}
          ref={nameRef}
        />

        {/* 이메일 (읽기 전용) */}
        <div>
          <label
            htmlFor={emailInputId}
            style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}
          >
            이메일
          </label>
          <input
            id={emailInputId}
            type="email"
            value={user.email}
            readOnly
            style={readOnlyInputStyle}
          />
        </div>

        <div style={separatorStyle} />

        {/* 비밀번호 변경 */}
        <p style={sectionTitleStyle}>비밀번호 변경</p>
        <FloatingLabelInput
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...currentPasswordRest}
          ref={currentPasswordRef}
        />
        <FloatingLabelInput
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          hint="영문자와 숫자를 포함하여 8자 이상"
          error={errors.newPassword?.message}
          {...newPasswordRest}
          ref={newPasswordRef}
        />

        <Button type="submit" fullWidth loading={updateMutation.isPending}>
          저장
        </Button>
      </form>

      <div style={separatorStyle} />

      {/* 회원 탈퇴 */}
      <div>
        <p style={sectionTitleStyle}>회원 탈퇴</p>
        <Button
          type="button"
          variant="destructive"
          fullWidth
          loading={deleteAccountMutation.isPending}
          onClick={handleDeleteAccount}
        >
          회원 탈퇴
        </Button>
      </div>
    </div>
  )
}
