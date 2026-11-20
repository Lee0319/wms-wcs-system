import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Grid3X3, Boxes, Activity, Truck, ArrowRight } from '@/lib/icons'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allTable } from '@/api/adapter'
import {
  dailyStats, aisleUsage, zones, aisles,
  type Inventory, type WcsTask, type Call, type Bin, type InboundOrder,
} from '@/mock/data'

const pad = (n: number) => String(n).padStart(2, '0')

function formatStamp(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const taskTypeVariant = (type: string) => {
  if (type === '下架') return 'warning' as const
  if (type === '移库' || type === '倒库') return 'secondary' as const
  return 'info' as const
}

export function Dashboard() {
  const [inv, setInv] = useState<Inventory[]>([])
  const [tasks, setTasks] = useState<WcsTask[]>([])
  const [calls, setCalls] = useState<Call[]>([])
  const [bins, setBins] = useState<Bin[]>([])
  const [inOrders, setInOrders] = useState<InboundOrder[]>([])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    allTable<Inventory>('inventory').then(setInv)
    allTable<WcsTask>('wcsTasks').then(setTasks)
    allTable<Call>('calls').then(setCalls)
    allTable<Bin>('bins').then(setBins)
    allTable<InboundOrder>('inboundOrders').then(setInOrders)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

  const totalQty = inv.reduce((s, i) => s + i.qty, 0)
  const batchCount = new Set(inv.map((i) => i.batch)).size
  const nearExpiry = inv.filter((i) => i.expiry && new Date(i.expiry).getTime() - Date.now() < 30 * 86400000).length

  const occupiedBins = bins.filter((b) => b.status !== '空货位' && b.status !== '停用').length
  const occupancy = bins.length ? Math.round((occupiedBins / bins.length) * 100) : 0

  const activeTasks = tasks.filter((t) => t.status !== '已完成')
  const pendingTasks = activeTasks.length
  const todayCalls = calls.length
  const responded = calls.filter((c) => c.status !== '待响应' && c.status !== '已取消')
  const avgResponse = responded.length
    ? Math.round(responded.reduce((s, c) => s + c.responseSec, 0) / responded.length)
    : 0

  const pendingPutaway = inOrders.filter((o) => o.status === '待上架').length
  const oneWayAisles = aisles.filter((a) => a.direction === '左进右出').length
  const soloZoneEnabled = zones.some((z) => z.strategy === '单物料专巷')

  const recent7 = dailyStats.slice(-7)
  const taskRows = activeTasks.slice(0, 5)

  return (
    <div className="space-y-4">
      <PageHeader
        title="综合驾驶舱"
        description="库位占用 / 在库库存 / 作业任务 / 托盘呼叫"
        group="我的工作台"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
        <span className="flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-success" />
          {isMock ? 'Mock 数据源已连接' : '数据库已连接'}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{formatStamp(now)}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="库位占用率"
          value={`${occupancy}%`}
          icon={Grid3X3}
          tone="blue"
          hint={`${aisleUsage.length} 条专巷 · ${occupiedBins}/${bins.length} 个货位`}
        />
        <StatCard
          title="在库库存"
          value={totalQty.toLocaleString()}
          icon={Boxes}
          tone="purple"
          hint={`件 · 按批次分段管理 · ${batchCount} 个批次`}
        />
        <StatCard
          title="待执行作业任务"
          value={pendingTasks}
          icon={Activity}
          tone="amber"
          hint="含出库 / 移库 / 上架"
        />
        <StatCard
          title="今日托盘呼叫"
          value={todayCalls}
          icon={Truck}
          tone="green"
          hint={avgResponse ? `AGV 平均响应 ${avgResponse} 秒` : '暂无 AGV 响应记录'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-base">近 7 日出库 / 入库量</CardTitle>
            <span className="text-xs text-muted-foreground">单位：托盘</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={recent7} margin={{ top: 5, right: 8, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.6 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inbound" name="入库" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} barSize={9} isAnimationActive={false} />
                <Bar dataKey="outbound" name="出库" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} barSize={9} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-base">各巷道库位利用率</CardTitle>
            <span className="text-xs text-muted-foreground">单物料专巷</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={aisleUsage} layout="vertical" margin={{ top: 8, right: 36, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="code" width={40} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip valueSuffix="%" />} cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.6 }} />
                <Bar dataKey="usage" fill="hsl(var(--chart-1))" radius={[0, 3, 3, 0]} barSize={12} isAnimationActive={false}>
                  <LabelList
                    dataKey="usage"
                    position="right"
                    formatter={(value: number) => `${value}%`}
                    fill="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">实时作业任务</CardTitle>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              WMS 下发 <ArrowRight className="h-3 w-3" /> WCS 执行
            </span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {['任务号', '类型', '巷道 / 货位', '执行设备', '进度', '状态'].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">暂无待执行任务</TableCell>
                  </TableRow>
                ) : taskRows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono">{t.no}</TableCell>
                    <TableCell>
                      <Badge variant={taskTypeVariant(t.type)} className="font-normal">{t.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{t.bin}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{t.device}</TableCell>
                    <TableCell><Progress value={100} className="h-1.5 w-24" /></TableCell>
                    <TableCell>
                      <Badge variant="success" className="font-normal">已完成</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">系统提示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '单物料专巷策略', value: <span className="text-sm font-medium">{soloZoneEnabled ? '已启用' : '未启用'}</span> },
              { label: '先进先出（FIFO）', value: <span className="text-sm font-medium">出库默认规则</span> },
              { label: '左进右出单向流', value: <Badge variant="secondary" className="font-normal">{oneWayAisles} 条巷道</Badge> },
              { label: '临期批次', value: <Badge variant="destructive" className="font-normal">{nearExpiry} 个待处理</Badge> },
              { label: '待上架收货单', value: <span className="text-sm font-medium">{pendingPutaway} 单</span> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 border-b border-dashed pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                {item.value}
              </div>
            ))}
            <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
              ZK03 成品区采用「一个物料一条专巷、左端入库 / 右端出库」的单向作业布局，出库分配按批次入库日期先进先出；数据来自{isMock ? '本地 Mock 数据源' : '后端数据服务'}。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
