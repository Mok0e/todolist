import { apiClient } from '@/lib/apiClient'
import type { Theme, Language } from '@/types'

export interface UpdateSettingsRequest {
  theme?: Theme
  language?: Language
}

export interface UpdateSettingsResponse {
  theme: Theme
  language: Language
}

export const settingsApi = {
  update: (body: UpdateSettingsRequest) =>
    apiClient.patch<UpdateSettingsResponse>('/users/me/settings', body),
}
