import { create } from 'zustand'
import { getSession, login as apiLogin, logout as apiLogout } from '@/api/adapter'

interface AuthState {
  user: { username: string; role: string } | null
  perms: string[]
  ready: boolean
  init: () => Promise<void>
  login: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  hasPerm: (perm: string) => boolean
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  perms: [],
  ready: false,
  init: async () => {
    const session = await getSession()
    if (session?.ok) {
      set({
        user: { username: session.username || '', role: session.role || '' },
        perms: session.perms || [],
        ready: true,
      })
    } else {
      set({ user: null, perms: [], ready: true })
    }
  },
  login: async (u, p) => {
    const res = await apiLogin(u, p)
    if (res.ok) {
      set({
        user: { username: res.username || u, role: res.role || '' },
        perms: res.perms || [],
      })
      return { ok: true }
    }
    return { ok: false, error: res.error }
  },
  logout: async () => {
    await apiLogout()
    set({ user: null, perms: [] })
  },
  hasPerm: (perm: string) => {
    const perms = get().perms
    return perms.includes('*') || perms.includes(perm)
  },
}))
