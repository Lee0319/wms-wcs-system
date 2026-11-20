import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown, LogOut, Bell, Search, Boxes,
} from '@/lib/icons'
import { toast } from 'sonner'
import { MENU_GROUPS, getGroupLabel } from '@/config/menu'
import { useAuth } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarRail,
  SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { SettingsSheet } from '@/components/shared/SettingsSheet'
import { useSidebarMode } from '@/store/sidebar-mode'
import { cn } from '@/lib/utils'

/** 侧栏内容 —— 用 shadcn SidebarMenu 语义组件，权限过滤 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPerm } = useAuth()
  const location = useLocation()
  const currentId = location.pathname.split('/').filter(Boolean)[1] || 'p0'

  return (
    <>
      <SidebarHeader className="h-16 justify-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">WMS-WCS</div>
            <div className="truncate text-[10px] text-sidebar-foreground/60">智能仓储集成系统</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {MENU_GROUPS.map((group, gi) => {
          const items = group.items.filter((item) => hasPerm(item.perm))
          if (items.length === 0) return null
          return (
            <SidebarGroup key={gi}>
              <SidebarGroupLabel>{group.label || '工作台'}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon
                    const active = currentId === item.id
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                        >
                          <Link to={`/app/${item.id}`} onClick={onNavigate}>
                            {Icon && <Icon className="h-4 w-4 shrink-0" />}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <div className="text-center text-[10px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          Mock 演示环境 · v1.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { variant } = useSidebarMode()
  const location = useLocation()
  const navigate = useNavigate()
  const currentLabel = getGroupLabel(location.pathname.split('/').filter(Boolean)[1] || 'p0')

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  const doLogout = async () => {
    await logout()
    toast.success('已退出登录')
    navigate('/login')
  }

  return (
    <SidebarProvider>
      {/* 侧栏变体由设置面板切换：sidebar / floating / inset */}
      <Sidebar variant={variant} collapsible="icon">
        <SidebarNav />
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        {/* 顶栏 */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-3 sm:px-5">
          <SidebarTrigger className="-ml-1" />

          <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <span>仓储管理</span>
            <span>/</span>
            <span className="font-medium text-foreground">{currentLabel || '工作台'}</span>
          </div>

          <div className="flex-1" />

          <div className="relative hidden w-64 items-center gap-2 lg:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="全局搜索…" className="h-9 bg-background pl-8" />
          </div>

          <ThemeToggle />
          <SettingsSheet />
          <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info('暂无新通知')}>
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {user?.username?.slice(0, 1) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-sm font-medium">{user?.username}</div>
                  <div className="text-[10px] text-muted-foreground">{user?.role}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>我的账号</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info(`${user?.username} · ${user?.role}`)}>个人信息</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('演示环境暂不支持修改密码')}>修改密码</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={doLogout}>
                <LogOut className="mr-2 h-4 w-4" /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
