import React, { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/auth/api'
import { settingsApi } from '@/features/settings/api'
import { queryKeys } from '@/lib/queryKeys'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Language, User } from '@/types'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: authApi.getMe,
  })

  useEffect(() => {
    if (user) {
      document.documentElement.setAttribute('data-theme', user.theme)
      if (i18n.language !== user.language) {
        void i18n.changeLanguage(user.language)
      }
    }
  }, [user, i18n])

  const mutation = useMutation({
    mutationFn: settingsApi.update,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() })
      const previousUser = queryClient.getQueryData<User>(queryKeys.user.me())
      queryClient.setQueryData<User>(queryKeys.user.me(), (old) =>
        old != null ? { ...old, ...patch } : old
      )
      if (patch.theme != null) {
        document.documentElement.setAttribute('data-theme', patch.theme)
      }
      if (patch.language != null) {
        // Optimistically update the query cache, but don't change i18n language yet
        // The language will be changed in onSuccess after successful API call
      }
      return { previousUser }
    },
    onSuccess: (_, variables) => {
      if (variables.language != null) {
        void i18n.changeLanguage(variables.language)
      }
    },
    onError: (_, __, context) => {
      if (context?.previousUser != null) {
        queryClient.setQueryData(queryKeys.user.me(), context.previousUser)
        document.documentElement.setAttribute('data-theme', context.previousUser.theme)
        void i18n.changeLanguage(context.previousUser.language)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() })
    },
  })

  const theme = user?.theme ?? 'LIGHT'
  const language = user?.language ?? 'ko'

  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 16px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 24px 0',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid var(--separator)',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    gap: '12px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '17px',
    color: 'var(--text-primary)',
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div data-testid="settings-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="52px" borderRadius="var(--radius-lg)" />
          <Skeleton height="52px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{t('settings.title')}</h1>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '0 4px', marginBottom: '6px' }}>
        {t('settings.appearance')}
      </div>
      <div style={sectionStyle}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={labelStyle}>{t('settings.theme')}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {theme === 'DARK' ? t('settings.themeDark') : t('settings.themeLight')}
            </span>
          </div>
          <ToggleSwitch
            checked={theme === 'DARK'}
            onChange={(checked) =>
              mutation.mutate({ theme: checked ? 'DARK' : 'LIGHT' })
            }
            disabled={mutation.isPending}
            ariaLabel={t('settings.theme')}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={rowStyle}>
          <span style={labelStyle}>{t('settings.language')}</span>
          <SegmentedControl
            options={[
              { value: 'ko', label: t('settings.langKo') },
              { value: 'en', label: t('settings.langEn') },
            ]}
            value={language}
            onChange={(value) => {
              if (value !== language) {
                mutation.mutate({ language: value as Language })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
