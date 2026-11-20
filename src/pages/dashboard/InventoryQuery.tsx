import { useState } from 'react'
import { Search, Download, Filter } from '@/lib/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from '@/lib/icons'
import { listTable } from '@/api/adapter'
import type { Inventory } from '@/mock/data'
import { useEffect } from 'react'
import * as XLSX from 'xlsx'

export function InventoryQuery() {
  const [rows, setRows] = useState<Inventory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ material: '', bin: '', batch: '', zone: '' })
  const pageSize = 10

  useEffect(() => {
    const kw = filters.material || filters.bin || filters.batch || filters.zone
    const fields = filters.material ? ['materialCode', 'materialName']
      : filters.bin ? ['binCode'] : filters.batch ? ['batch'] : filters.zone ? ['zone'] : []
    listTable<Inventory>('inventory', { page, pageSize, keyword: kw, fields }).then((r) => {
      setRows(r.list); setTotal(r.total)
    })
  }, [page, filters])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '库存')
    XLSX.writeFile(wb, `库存查询_${Date.now()}.xlsx`)
    toast.success(`已导出 ${rows.length} 条库存记录`)
  }

  return (
    <div className="space-y-4">
      <PageHeader title="库存查询" description="按货位 / 物料 / 批次查询库存" group="我的工作台"
        actions={<Button variant="outline" size="sm" onClick={exportData}><Download className="h-4 w-4" /> 导出 CSV</Button>} />

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-4">
            {([
              ['material', '物料编码/名称', '如 SKU-1001'],
              ['bin', '货位编码', '如 A01A05'],
              ['batch', '批次号', '如 B-2026001'],
              ['zone', '库区', '如 ZK01'],
            ] as const).map(([key, label, ph]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Input className="h-8" placeholder={ph} value={filters[key]} onChange={(e) => { setFilters({ ...filters, [key]: e.target.value }); setPage(1) }} />
              </div>
            ))}
            <div className="flex items-end">
              <Button variant="secondary" size="sm" className="h-8" onClick={() => setFilters({ material: '', bin: '', batch: '', zone: '' })}>
                <Filter className="h-3.5 w-3.5" /> 重置
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  {['货位编码', '巷道', '库区', '物料', '批次', '数量', '预占', '托盘码', '入库日期', '库龄', '状态'].map((h) => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? <TableRow><TableCell colSpan={11} className="h-32 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
                  : rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.binCode}</TableCell>
                      <TableCell>{r.aisle}</TableCell>
                      <TableCell>{r.zone}</TableCell>
                      <TableCell><div className="text-xs"><div className="font-medium">{r.materialName}</div><div className="text-muted-foreground">{r.materialCode}</div></div></TableCell>
                      <TableCell className="font-mono text-xs">{r.batch}</TableCell>
                      <TableCell className="tabular-nums font-medium">{r.qty}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{r.reserved}</TableCell>
                      <TableCell className="font-mono text-xs">{r.palletCode}</TableCell>
                      <TableCell className="text-xs">{r.inDate}</TableCell>
                      <TableCell className="text-xs">{r.age}天</TableCell>
                      <TableCell><StatusBadge value={r.quality} /></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>共 {total} 条 · 第 {page}/{pageCount} 页</span>
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
