import { useEffect, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Package, ArrowDownToLine, ArrowUpFromLine, Truck, AlertTriangle,
  Activity, Clock, CheckCircle2,
} from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { allTable } from '@/api/adapter'
import { dailyStats, abcDistribution, zoneUsage, type Inventory, type WcsTask, type Call, type Device } from '@/mock/data'

export function Dashboard() {
  const [inv, setInv] = useState<Inventory[]>([])
  const [tasks, setTasks] = useState<WcsTask[]>([])
  const [calls, setCalls] = useState<Call[]>([])
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    allTable<Inventory>('inventory').then(setInv)
    allTable<WcsTask>('wcsTasks').then(setTasks)
    allTable<Call>('calls').then(setCalls)
    allTable<Device>('devices').then(setDevices)
  }, [])

  const totalQty = inv.reduce((s, i) => s + i.qty, 0)
  const reservedQty = inv.reduce((s, i) => s + i.reserved, 0)
  const nearExpiry = inv.filter((i) => i.expiry && new Date(i.expiry).getTime() - Date.now() < 30 * 86400000).length
  const runningDevices = devices.filter((d) => d.status === '运行').length
  const activeTasks = tasks.filter((t) => t.status !== '已完成').length
  const pendingCalls = calls.filter((c) => c.status !== '已完成' && c.status !== '已取消').length

  return (
    <div className="space-y-5">
      <PageHeader
        title="综合驾驶舱"
        description="库存总量 / 库龄汇总 / 出入库趋势 / 设备状态"
        group="我的工作台"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="库存总量" value={totalQty.toLocaleString()} icon={Package} hint="件 · 全仓库存" tone="blue" trend={8.2} />
        <StatCard title="已预占库存" value={reservedQty.toLocaleString()} icon={ArrowUpFromLine} hint="件 · 出库预留" tone="purple" />
        <StatCard title="待处理 WCS 任务" value={activeTasks} icon={Activity} hint={`${runningDevices} 台设备运行中`} tone="amber" />
        <StatCard title="临期批次预警" value={nearExpiry} icon={AlertTriangle} hint="30 天内到期" tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">出入库趋势</CardTitle>
            <CardDescription>近 14 日每日入库 / 出库 / 托盘呼叫量</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="inbound" name="入库托数" stroke="hsl(var(--chart-1))" style={{ stroke: 'hsl(var(--chart-1))' }} fill="url(#inGrad)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="outbound" name="出库托数" stroke="hsl(var(--chart-2))" style={{ stroke: 'hsl(var(--chart-2))' }} fill="url(#outGrad)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="calls" name="托盘呼叫" stroke="hsl(var(--chart-3))" style={{ stroke: 'hsl(var(--chart-3))' }} fill="transparent" strokeWidth={1.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">物料 ABC 分类</CardTitle>
            <CardDescription>按周转价值分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={abcDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} isAnimationActive={false} label={({ name, value }) => `${name} ${value}%`}>
                  {abcDistribution.map((_, i) => <Cell key={i} fill={['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--muted-foreground))'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {abcDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: ['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--muted-foreground))'][i] }} />
                    {d.name} 物料
                  </span>
                  <span className="text-muted-foreground">{d.count} 种</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">库区使用率</CardTitle>
            <CardDescription>各库区当前容量水位</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {zoneUsage.map((z) => (
              <div key={z.zone} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{z.zone}</span>
                  <span className="text-muted-foreground text-xs">容量 {z.容量} · 使用率 {z.使用率}%</span>
                </div>
                <Progress value={z.使用率} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">实时动态</CardTitle>
            <CardDescription>最近作业事件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: ArrowDownToLine, color: 'text-info', text: '收货单 RK20261118 已上架', time: '3 分钟前' },
                { icon: Truck, color: 'text-warning', text: `托盘呼叫待处理 ${pendingCalls} 单`, time: '8 分钟前' },
                { icon: CheckCircle2, color: 'text-success', text: '波次 WAVE-006 拣选完成', time: '15 分钟前' },
                { icon: Clock, color: 'text-chart-4', text: '设备 STK-02 完成倒库任务', time: '22 分钟前' },
                { icon: AlertTriangle, color: 'text-destructive', text: `临期批次 ${nearExpiry} 条需关注`, time: '刚刚' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 ${item.color}`}><item.icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-relaxed">{item.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
