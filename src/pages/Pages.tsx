import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  RadioTower, Activity, SlidersHorizontal, BookOpenText, ShieldCheck, Database,
  ScrollText, Trash2, RotateCcw, Wrench, PanelTop, Table2, RefreshCw, Play,
  CheckCircle2, AlertTriangle, Plus,
} from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allTable, doAction } from '@/api/adapter'
import { findMenuItem } from '@/config/menu'
import type { Device, WcsTask, Account, Role, LogEntry, RecycleItem, TableSchema, Rule } from '@/mock/data'
import { cn } from '@/lib/utils'

// ============ WCS 与配置 ============

function DeviceMonitor() {
  const [devices, setDevices] = useState<Device[]>([])
  const [tasks, setTasks] = useState<WcsTask[]>([])
  useEffect(() => {
    allTable<Device>('devices').then(setDevices)
    allTable<WcsTask>('wcsTasks').then(setTasks)
  }, [])
  const running = devices.filter((d) => d.status === '运行').length
  const abnormal = devices.filter((d) => d.status === '异常' || d.status === '故障').length
  const active = tasks.filter((t) => t.status !== '已完成').length

  return (
    <div className="space-y-4">
      <PageHeader title="设备与任务监控" description="堆垛机 / 输送线 / 提升机 / AGV 状态与队列" group="WCS 与配置"
        actions={<Button size="sm" variant="outline" onClick={() => { allTable<Device>('devices').then(setDevices); allTable<WcsTask>('wcsTasks').then(setTasks); toast.success('已刷新') }}><RefreshCw className="h-4 w-4" /> 刷新</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="设备总数" value={devices.length} icon={RadioTower} hint="台设备在线" tone="blue" />
        <StatCard title="运行中" value={running} icon={Activity} hint="设备作业中" tone="green" />
        <StatCard title="异常设备" value={abnormal} icon={AlertTriangle} hint="需关注" tone="red" />
        <StatCard title="待处理任务" value={active} icon={Play} hint="任务队列中" tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">设备状态</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="bg-muted/40"><TableHead>设备编号</TableHead><TableHead>类型</TableHead><TableHead>巷道</TableHead><TableHead>状态</TableHead><TableHead>负载</TableHead></TableRow></TableHeader>
              <TableBody>
                {devices.slice(0, 10).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.code}</TableCell>
                    <TableCell className="text-sm">{d.type}</TableCell>
                    <TableCell className="text-sm">{d.aisle}</TableCell>
                    <TableCell><StatusBadge value={d.status} /></TableCell>
                    <TableCell className="w-24"><div className="flex items-center gap-2"><Progress value={d.load} className="h-1.5" /><span className="text-sm tabular-nums">{d.load}%</span></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">WCS 任务队列</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="bg-muted/40"><TableHead>任务号</TableHead><TableHead>类型</TableHead><TableHead>设备</TableHead><TableHead>状态</TableHead><TableHead>进度</TableHead></TableRow></TableHeader>
              <TableBody>
                {tasks.slice(0, 10).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.no}</TableCell>
                    <TableCell className="text-sm">{t.type}</TableCell>
                    <TableCell className="font-mono text-sm">{t.device}</TableCell>
                    <TableCell><StatusBadge value={t.status} /></TableCell>
                    <TableCell className="w-24"><div className="flex items-center gap-2"><Progress value={t.progress} className="h-1.5" /><span className="text-sm tabular-nums">{t.progress}%</span></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RuleConfig() {
  const [rules, setRules] = useState<Rule[]>([])
  useEffect(() => { allTable<Rule>('rules').then(setRules) }, [])
  const toggle = async (id: string, enabled: boolean) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled } : r))
    await doAction('ruleToggle')
    toast.success(`策略已${enabled ? '开启' : '关闭'}`)
  }
  return (
    <div className="space-y-4">
      <PageHeader title="规则与策略配置" description="FIFO / 混批 / 单向流 / 就近分配策略开关" group="WCS 与配置" />
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-6 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{r.name}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <StatusBadge value={r.enabled ? '启用' : '停用'} />
                </div>
              </div>
              <Switch checked={r.enabled} onCheckedChange={(v) => toggle(r.id, v)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const strategyGroups = [
  { title: '存储策略', desc: '库位分配与物料存放规则', items: ['就近空位优先', '同物料集中存放', 'ABC 分类分区', '体积匹配货位'] },
  { title: '上架策略', desc: '收货上架的货位推荐规则', items: ['物料-巷道绑定优先', '联动组顺序存入', '就近空货位推荐', '单物料专巷约束'] },
  { title: '补货策略', desc: '拣选位库存补充规则', items: ['低水位自动触发', '按需求量补货', '整托补货', 'AGV 自动补给'] },
  { title: '波次策略', desc: '订单合并与拣选路径', items: ['按巷道顺序合并', '按承运商截单', '按优先级排序', '最短路径优化'] },
  { title: '分配策略', desc: '出库库存预占规则', items: ['先进先出 FIFO', '近效期先出 FEFO', '锁定批次排除', '预占 reserved_qty'] },
  { title: '拣货策略', desc: '拣选执行与回写规则', items: ['扫码货位批次校验', '短拣原因记录', '逐行扣减库存', '自动生成出库流水'] },
]

function StrategyGuide() {
  return (
    <div className="space-y-4">
      <PageHeader title="策略说明" description="WMS 六大策略 · 存储 / 上架 / 补货 / 波次 / 分配 / 拣货" group="WCS 与配置" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategyGroups.map((g, i) => (
          <Card key={g.title}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs">{i + 1}</span>
                {g.title}
              </CardTitle>
              <CardDescription>{g.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpenText className="h-4 w-4" /> 落地要点</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>策略开关在「规则与策略配置」中统一维护；修改后影响后续单据的分配与上架推荐，不影响已生成的任务。</p>
          <p>FIFO 与 FEFO 可同时启用：有保质期的物料按效期优先，其余物料按入库日期先后分配。锁定批次与临期批次会在台账中标红提示。</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function WcsPages({ id }: { id: string }) {
  const item = findMenuItem(id)
  if (id === 'p8') return <DeviceMonitor />
  if (id === 'p9') return <RuleConfig />
  if (id === 'p12') return <StrategyGuide />
  return <PageHeader title={item?.label || ''} />
}

// ============ 权限管理 / 系统查看 ============

const accountColumns: Column[] = [
  { key: 'username', title: '登录账号', render: (r) => <span className="font-mono text-sm">{r.username}</span> },
  { key: 'realName', title: '实名' },
  { key: 'role', title: '角色', render: (r) => <Badge variant="outline">{r.role}</Badge> },
  { key: 'phone', title: '电话' },
  { key: 'email', title: '邮箱' },
  { key: 'warehouse', title: '锁定仓库', render: (r) => r.warehouse || <span className="text-muted-foreground">全部仓库</span> },
  { key: 'enabled', title: '启用', render: (r) => <StatusBadge value={r.enabled ? '启用' : '停用'} /> },
]
const accountFields: FormField[] = [
  { key: 'username', label: '登录账号', required: true },
  { key: 'realName', label: '实名', required: true },
  { key: 'role', label: '角色', options: ['管理员', '入库操作员', '拣选员', 'WCS 监控员', '数据管理员'] },
  { key: 'phone', label: '电话' }, { key: 'email', label: '邮箱' },
  { key: 'warehouse', label: '锁定仓库', options: ['', 'WH01', 'WH02'] },
  { key: 'enabled', label: '启用', options: ['启用', '停用'] },
]

function UserManagement() {
  return (
    <div className="space-y-4">
      <PageHeader title="用户管理" description="账号 / 角色 / 联系方式 · 密码编辑留空表示不修改" group="权限管理" />
      <div className="rounded-lg border bg-info/10 px-4 py-2.5 text-sm text-info">
        新增账号密码必填；编辑时密码留空表示不修改。锁定仓库用于料箱库页固定仓库，留空 = 全部仓库。
      </div>
      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">用户账号</TabsTrigger>
          <TabsTrigger value="roles">角色权限</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-4">
          <CrudTable table="accounts" columns={accountColumns} searchFields={['username', 'realName', 'role']} formFields={accountFields} exportName="用户账号" />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader><TableRow className="bg-muted/40"><TableHead>角色编号</TableHead><TableHead>角色名称</TableHead><TableHead>权限标识</TableHead><TableHead>说明</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    ['R01', '管理员', '*', '全部权限'],
                    ['R02', '入库操作员', 'wms:view, wms:inbound, wms:base', '收货上架与基础数据'],
                    ['R03', '拣选员', 'wms:view, wms:pick', '波次拣选'],
                    ['R04', 'WCS 监控员', 'wms:view, wcs:monitor', '设备与任务监控'],
                    ['R05', '数据管理员', 'wms:view, wms:data, wms:log', '数据管理与日志'],
                  ].map((r) => (
                    <TableRow key={r[0]}>
                      <TableCell className="font-mono text-sm">{r[0]}</TableCell>
                      <TableCell className="text-sm font-medium">{r[1]}</TableCell>
                      <TableCell><code className="text-sm bg-muted px-1.5 py-0.5 rounded">{r[2]}</code></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r[3]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DataManagement() {
  return (
    <div className="space-y-4">
      <PageHeader title="数据管理" description="归档流水 / 手动归档 / 库位图布局存取" group="系统查看" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> 流水归档</CardTitle><CardDescription>超过 90 天的历史流水归档</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">当前账期流水</span><span>12,480 条</span></div><div className="flex justify-between"><span className="text-muted-foreground">已归档</span><span>86,300 条</span></div></div>
            <Button size="sm" onClick={() => toast.success('手动归档完成，已写入归档表')}>手动归档</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">系统设置</CardTitle><CardDescription>库位图布局等键值配置</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">库位图布局</span><Badge variant="success">已保存</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">在线会话数</span><span>3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">数据源</span><Badge variant="info">{import.meta.env.VITE_USE_MOCK !== 'false' ? '本地 Mock' : '真实后端'}</Badge></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const logColumns: Column[] = [
  { key: 'time', title: '时间', render: (r) => <span className="font-mono text-sm">{r.time}</span> },
  { key: 'level', title: '级别', render: (r) => <StatusBadge value={r.level} /> },
  { key: 'module', title: '模块' },
  { key: 'user', title: '操作员' },
  { key: 'action', title: '操作' },
  { key: 'detail', title: '详情', render: (r) => <span className="text-sm text-muted-foreground">{r.detail}</span> },
]

function LogViewer() {
  const [level, setLevel] = useState('全部级别')
  return (
    <div className="space-y-4">
      <PageHeader title="日志查看" description="按级别 / 模块过滤最近 300 条操作日志" group="系统查看" />
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            {['全部级别', '信息', '成功', '警告', '错误'].map((l) => (
              <Button key={l} size="sm" variant={level === l ? 'default' : 'outline'} onClick={() => setLevel(l)}>{l}</Button>
            ))}
          </div>
          <div className="rounded-lg border" style={{ maxHeight: 560, overflowY: 'auto' }}>
            <LogTable level={level} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LogTable({ level }: { level: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  useEffect(() => { allTable<LogEntry>('logs').then(setLogs) }, [])
  const filtered = level === '全部级别' ? logs : logs.filter((l) => l.level === level)
  return (
    <Table>
      <TableHeader><TableRow className="bg-muted/40 sticky top-0">
        {logColumns.map((c) => <TableHead key={c.key}>{c.title}</TableHead>)}
      </TableRow></TableHeader>
      <TableBody>
        {filtered.slice(0, 60).map((r) => (
          <TableRow key={r.id}>
            {logColumns.map((c) => <TableCell key={c.key}>{c.render ? c.render(r) : (r as any)[c.key]}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const recycleColumns: Column[] = [
  { key: 'type', title: '类型', render: (r) => <Badge variant="outline">{r.type}</Badge> },
  { key: 'name', title: '名称', render: (r) => <span className="font-mono text-sm">{r.name}</span> },
  { key: 'deletedAt', title: '删除时间' },
  { key: 'operator', title: '操作人' },
  { key: 'reason', title: '原因' },
]

function RecycleBin() {
  return (
    <div className="space-y-4">
      <PageHeader title="回收站" description="已删除单据快照 / 恢复 / 彻底删除" group="系统查看" />
      <div className="rounded-lg border bg-warning/10 px-4 py-2.5 text-sm text-warning">
        恢复单据时会重建主表与明细；恢复已上架单据时将回补库存。
      </div>
      <CrudTable table="recycleItems" columns={recycleColumns} searchFields={['name', 'type']}
        formFields={[]} canCreate={false} canEdit={false} canDelete
        extraActions={(row) => (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" title="恢复"
            onClick={() => toast.success(`已恢复「${row.name}」，重建单据并回补库存`)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )} />
    </div>
  )
}

export function SystemPages({ id }: { id: string }) {
  const item = findMenuItem(id)
  if (id === 'p14') return <UserManagement />
  if (id === 'p13') return <DataManagement />
  if (id === 'p25') return <LogViewer />
  if (id === 'p26') return <RecycleBin />
  return <PageHeader title={item?.label || ''} />
}

// ============ 设计开发 ============

function TableDesign() {
  const [tables, setTables] = useState<TableSchema[]>([])
  const [selected, setSelected] = useState<TableSchema | null>(null)
  useEffect(() => { allTable<TableSchema>('tableSchemas').then((r) => { setTables(r); setSelected(r[0] || null) }) }, [])
  return (
    <div className="space-y-4">
      <PageHeader title="数据库表设计" description="系统元数据 · 实时读取表结构 / 扩展属性描述" group="设计开发"
        actions={<Button size="sm" onClick={() => toast.info('演示环境：DDL 操作已禁用')}><Plus className="h-4 w-4" /> 新建表</Button>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Table2 className="h-4 w-4" /> 全部业务表</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[520px] overflow-y-auto">
              {tables.map((t) => (
                <button key={t.name} onClick={() => setSelected(t)}
                  className={cn('w-full text-left rounded-md px-3 py-2 text-sm transition-colors',
                    selected?.name === t.name ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                  <div className="font-mono">{t.name}</div>
                  <div className={cn('text-[10px]', selected?.name === t.name ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{t.cn}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> {selected?.cn || '表结构'}</CardTitle>
            <CardDescription className="font-mono">{selected?.name} · {selected?.comment}</CardDescription>
          </CardHeader>
          <CardContent>
            {selected && (
              <Table>
                <TableHeader><TableRow className="bg-muted/40"><TableHead>字段名</TableHead><TableHead>类型</TableHead><TableHead>可空</TableHead><TableHead>注释</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selected.fields.map((f) => (
                    <TableRow key={f.name}>
                      <TableCell className="font-mono text-sm">{f.name}</TableCell>
                      <TableCell><code className="text-sm bg-muted px-1.5 py-0.5 rounded">{f.type}</code></TableCell>
                      <TableCell className="text-sm">{f.nullable ? '是' : '否'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.comment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FormDesign() {
  return (
    <div className="space-y-4">
      <PageHeader title="窗体界面设计" description="可视化表单设计器（演示版）" group="设计开发" />
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><PanelTop className="h-4 w-4" /> 控件库</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {['单行文本', '多行文本', '数字', '下拉选择', '单选', '复选', '日期', '开关'].map((c) => (
              <Badge key={c} variant="outline" className="cursor-pointer hover:bg-accent">{c}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-base">画布预览</CardTitle><CardDescription>拖拽控件到画布进行布局</CardDescription></CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed min-h-[320px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
              <PanelTop className="h-10 w-10 opacity-40" />
              <div className="text-sm">窗体设计画布</div>
              <div className="text-sm">从左侧控件库拖入控件以设计表单布局</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DataDictionary() {
  return (
    <div className="space-y-4">
      <PageHeader title="数据字典" description="系统元数据 · 字段字典" group="设计开发" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"><ConstructionIcon /></div>
          <div>
            <h3 className="text-lg font-semibold">规划中</h3>
            <p className="text-sm text-muted-foreground mt-1.5">数据字典功能在原系统中标注为规划中，暂未开放。</p>
          </div>
          <Badge variant="warning">soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}

function ConstructionIcon() {
  return <Wrench className="h-8 w-8 text-muted-foreground" />
}

export function DesignPages({ id }: { id: string }) {
  const item = findMenuItem(id)
  if (id === 'p27') return <TableDesign />
  if (id === 'd2') return <FormDesign />
  if (id === 'd5') return <DataDictionary />
  return <PageHeader title={item?.label || ''} />
}
