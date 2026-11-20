import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'wms_theme'

interface ThemeState {
  theme: ThemeMode
  init: () => void
  setTheme: (theme: ThemeMode) => void
  toggle: () => void
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem(STORAGE_KEY, theme)
}

function readInitial(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  // 未设置时跟随系统偏好
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'light',
  init: () => {
    const theme = readInitial()
    applyTheme(theme)
    set({ theme })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggle: () => {
    const next: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    set({ theme: next })
  },
}))
