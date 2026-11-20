import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { PageRenderer } from '@/pages/PageRenderer'
import { useAuth } from '@/store/auth'
import { useTheme } from '@/store/theme'
import { findMenuItem } from '@/config/menu'

function ProtectedApp() {
  const { id } = useParams()
  const { user, hasPerm, ready } = useAuth()

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (!user) return <Navigate to="/login" replace />
  const item = findMenuItem(id || 'p0')
  if (!item) return <Navigate to="/app/p0" replace />
  if (!hasPerm(item.perm)) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-3">
          <div className="text-5xl">🔒</div>
          <h2 className="text-xl font-semibold">无权访问</h2>
          <p className="text-sm text-muted-foreground">当前角色的权限不包含「{item.label}」，请联系管理员开通 {item.perm}。</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageRenderer id={item.id} />
    </AppShell>
  )
}

export default function App() {
  const { init } = useAuth()
  const { init: initTheme } = useTheme()
  useEffect(() => {
    init()
    initTheme()
  }, [init, initTheme])

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app/:id" element={<ProtectedApp />} />
        <Route path="/" element={<Navigate to="/app/p0" replace />} />
        <Route path="*" element={<Navigate to="/app/p0" replace />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </HashRouter>
  )
}
