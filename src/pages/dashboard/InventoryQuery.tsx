import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, RefreshCw, RotateCcw, Search } from '@/lib/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allTable } from '@/api/adapter'
import { materials, zones, type Inventory } from '@/mock/data'
import * as XLSX from 'xlsx'

const pad = (n: number) => String(n).padStart(2, '0')
const formatStamp = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

interface Query {
  keyword: string
  material: string
  aisle: string
  supplier: string
  customer: string
  status: string
  from: string
  to: string
}

const emptyQuery: Query = {
  keyword: '', material: 'all', aisle: 'all', supplier: 'all',
  customer: 'all', status: 'all', from: '', to: '',
}

const statusOf = (r: Inventory) => (r.quality === '待检' ? '待检' : '可用')
const availableOf = (r: Inventory) => Math.max(0, r.qty - r.reserved)
const zoneName = (code: string) => zones.find((z) => z.code === code)?.name ?? code

function KpiCard({ title, value, suffix, hint }: { title: string; value: string | number; suffix?: string; hint: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function InventoryQuery() {
  const [rows, setRows] = useState<Inventory[]>([])
  const [draft, setDraft] = useState<Query>(emptyQuery)
  const [page, setPage] = useState(1)
  const [now, setNow] = useState(() => new Date())
  const pageSize = 10
  const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

  const load = () => allTable<Inventory>('inventory').then(setRows)

  useEffect(() => {
    load()
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filtered = useMemo(() => {
    const kw = draft.keyword.trim().toLowerCase()
    return rows.filter((r) => {
      if (draft.material !== 'all' && r.materialCode !== draft.material) return false
      if (draft.aisle !== 'all' && r.aisle !== draft.aisle) return false
      if (draft.supplier !== 'all' && r.supplier !== draft.supplier) return false
      if (draft.customer !== 'all' && r.customer !== draft.customer) return false
      if (draft.status !== 'all' && statusOf(r) !== draft.status) return false
      if (draft.from && r.inDate < draft.from) return false
      if (draft.to && r.inDate > draft.to) return false
      if (kw) {
        const hay = [r.materialName, r.materialCode, r.binCode, r.batch, r.palletCode, r.supplier, r.customer].join(' ').toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
  }, [rows, draft])

  useEffect(() => { setPage(1) }, [draft])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const binCount = new Set(filtered.map((r) => r.binCode)).size
  const totalQty = filtered.reduce((s, r) => s + r.qty, 0)
  const totalAvailable = filtered.reduce((s, r) => s + availableOf(r), 0)
  const batchCount = new Set(filtered.map((r) => r.batch)).size
  const palletCount = new Set(filtered.map((r) => r.palletCode)).size
  const supplierCount = new Set(filtered.map((r) => r.supplier)).size
  const customerCount = new Set(filtered.map((r) => r.customer)).size

  const supplierOptions = useMemo(() => [...new Set(rows.map((r) => r.supplier))], [rows])
  const customerOptions = useMemo(() => [...new Set(rows.map((r) => r.customer))], [rows])
  const aisleOptions = useMemo(() => [...new Set(rows.map((r) => r.aisle))].sort(), [rows])

  const applyQuery = () => { setPage(1); toast.success(`已按当前条件筛选 ${filtered.length} 条`) }
  const resetQuery = () => { setDraft(emptyQuery) }

  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(filtered)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '库存')
    XLSX.writeFile(wb, `库存查询_${Date.now()}.xlsx`)
    toast.success(`已导出 ${filtered.length} 条库存记录`)
  }

  return (
    <div className="space-y-4">
      <PageHeader title="库存查询" description="按货位 / 物料 / 批次查询库存明细" group="我的工作台" />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
        <span className="flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-success" />
          {isMock ? 'Mock 数据源已连接' : '数据库已连接'}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{formatStamp(now)}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="在库货位" value={binCount} suffix="个" hint="当前筛选结果 · 含预占货位" />
        <KpiCard title="库存数量 / 可用" value={totalQty.toLocaleString()} suffix={`/ ${totalAvailable.toLocaleString()}`} hint="按货位库存汇总" />
        <KpiCard title="涉及批次 / 托盘" value={batchCount} suffix={`/ ${palletCount}`} hint="一货位一托盘一批次" />
        <KpiCard title="供应商 / 客户" value={supplierCount} suffix={`/ ${customerCount}`} hint="按来源单据与需求订单关联" />
      </div>

      <Card>
        <CardContent className="space-y-3 p-6">

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            <div className="relative w-full lg:col-span-2">
              <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-8 w-full pl-8"
                placeholder="物料 / 库位 / 批次 / 托盘号 / 供应商 / 客户"
                value={draft.keyword}
                onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') applyQuery() }}
              />
            </div>
            <Select value={draft.material} onValueChange={(v) => setDraft({ ...draft, material: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="全部物料" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部物料</SelectItem>
                {materials.map((m) => <SelectItem key={m.code} value={m.code}>{m.name} · {m.code}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={draft.aisle} onValueChange={(v) => setDraft({ ...draft, aisle: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="全部巷道" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部巷道</SelectItem>
                {aisleOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={draft.supplier} onValueChange={(v) => setDraft({ ...draft, supplier: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="全部供应商" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部供应商</SelectItem>
                {supplierOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={draft.customer} onValueChange={(v) => setDraft({ ...draft, customer: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="全部客户" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部客户</SelectItem>
                {customerOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="全部状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="可用">可用</SelectItem>
                <SelectItem value="待检">待检</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              value={{ from: draft.from, to: draft.to }}
              onChange={(v) => setDraft({ ...draft, from: v.from, to: v.to })}
            />
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={applyQuery}><Search className="h-3.5 w-3.5" /> 查询</Button>
              <Button variant="outline" size="sm" onClick={resetQuery}><RotateCcw className="h-3.5 w-3.5" /> 重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 px-6 py-4">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-base">库存明细</CardTitle>
            <span className="text-xs text-muted-foreground">
              共 {filtered.length} 条 · 合计 {totalQty.toLocaleString()} · 可用 {totalAvailable.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportData}><Download className="h-3.5 w-3.5" /> 导出 CSV</Button>
            <Button variant="outline" size="sm" onClick={() => { load(); toast.success('已刷新库存数据') }}>
              <RefreshCw className="h-3.5 w-3.5" /> 刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="[&_th:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:first-child]:pl-6 [&_td:last-child]:pr-6">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {['物料', '库位', '批次', '托盘号', '数量', '可用', '来源供应商', '关联客户', '入库日期', '效期', '库龄', '状态'].map((h) => (
                  <TableHead key={h} className="whitespace-nowrap px-2 text-sm">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : pageRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap px-2 py-3">
                    <div className="font-medium">{r.materialName}</div>
                    <div className="text-xs text-muted-foreground">{r.materialCode} · {r.spec}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-3">
                    <div className="font-mono">{r.binCode}</div>
                    <div className="text-xs text-muted-foreground">{zoneName(r.zone)} · {r.face} 面</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 font-mono">{r.batch}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 font-mono text-muted-foreground">{r.palletCode}</TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <span className="tabular-nums font-medium">{r.qty}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{r.unit}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">{availableOf(r)}</TableCell>
                  <TableCell className="whitespace-nowrap px-2">{r.supplier}</TableCell>
                  <TableCell className="whitespace-nowrap px-2">{r.customer}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">{r.inDate}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">{r.expiry || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">{r.age} 天</TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <Badge variant={statusOf(r) === '可用' ? 'success' : 'warning'} className="font-normal">{statusOf(r)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>共 {filtered.length} 条 · 第 {page}/{pageCount} 页</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
