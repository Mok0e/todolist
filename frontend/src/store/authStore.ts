import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  userId: string | null
  setToken: (token: string, userId: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      setToken: (token, userId) => set({ accessToken: token, userId }),
      clearToken: () => set({ accessToken: null, userId: null }),
    }),
    { name: 'auth-storage' }
  )
)
