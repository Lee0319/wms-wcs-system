import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Eye, EyeOff, ShieldCheck, Warehouse, Truck, GitBranch } from '@/lib/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/store/auth'

export function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/app/p0', { replace: true }) }, [user, navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { toast.error('请输入账号和密码'); return }
    setLoading(true)
    const res = await login(username, password)
    setLoading(false)
    if (res.ok) {
      toast.success('登录成功，已按权限生成菜单')
      navigate('/app/p0', { replace: true })
    } else {
      toast.error(res.error || '登录失败')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-primary-foreground/5" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">WMS-WCS</div>
            <div className="text-xs text-primary-foreground/80">智能仓储集成系统</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">仓储作业<br />一体化管理平台</h1>
            <p className="text-primary-foreground/80 leading-relaxed">
              覆盖收货上架、库存批次、波次拣选、托盘调度与 WCS 设备监控，配合 FIFO / FEFO 策略，让仓储作业高效、可视、可追溯。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Warehouse, label: '智能库内作业' },
              { icon: Truck, label: 'AGV 托盘调度' },
              { icon: GitBranch, label: 'WCS 任务监控' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-lg bg-primary-foreground/10 p-3 backdrop-blur-sm">
                <Icon className="h-5 w-5 mb-2" />
                <div className="text-xs text-primary-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-primary-foreground/70 relative z-10">© 2026 WMS-WCS · 前端复刻演示版</div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">WMS-WCS</div>
              <div className="text-xs text-muted-foreground">智能仓储集成系统</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">欢迎回来</h2>
            <p className="text-sm text-muted-foreground mt-1.5">请输入账号密码登录系统</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">账号</Label>
                  <Input id="username" placeholder="请输入账号" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中…' : '登 录'}
                </Button>
              </form>

              <div className="mt-5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <ShieldCheck className="h-3.5 w-3.5" /> 演示账号提示
                </div>
                <div>管理员：<code className="px-1 bg-background rounded">admin</code> / 任意密码 — 拥有全部权限</div>
                <div>其他账号：wangqiang（入库）、lina（拣选）、zhangwei（WCS）</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
