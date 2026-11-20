import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScanLine, Truck, Layers3 } from '@/lib/icons'

const details = [
  { id: 'D1', no: 'RK20261118001', material: 'SKU-1001 冷轧钢卷', batch: 'B-2026001', qty: 200 },
  { id: 'D2', no: 'RK20261118001', material: 'SKU-1004 铝型材', batch: 'B-2026004', qty: 150 },
  { id: 'D3', no: 'RK20261117003', material: 'SKU-1007 伺服电机', batch: 'B-2026007', qty: 80 },
  { id: 'D4', no: 'RK20261117002', material: 'SKU-1002 热轧钢板', batch: 'B-2026002', qty: 300 },
]

export function BoxPutaway() {
  const [checked, setChecked] = useState<string[]>(['D1'])
  const [tab, setTab] = useState('direct')
  const [scanned, setScanned] = useState('')

  const total = details.filter((d) => checked.includes(d.id)).reduce((s, d) => s + d.qty, 0)

  return (
    <div className="space-y-4">
      <PageHeader title="料箱库上架" description="二楼料箱库 · 呼叫库内物料 / 重新组托上架 / 直接上架" group="入库与库存" />

      <div className="rounded-lg border bg-info/10 px-4 py-2.5 text-xs text-info flex items-center gap-2">
        <Badge variant="info">仓库 / 库区</Badge>
        按仓库 / 库区限定物料范围；当前已锁定 <strong>WH01 / 二楼料箱库</strong>，如需变更请联系管理员。
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>① 勾选待上架明细</span>
            <Badge variant="secondary">{details.length} 行待上架</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow className="bg-muted/40">
              <TableHead className="w-10"></TableHead><TableHead>收货单号</TableHead><TableHead>物料 / 批次</TableHead>
              <TableHead>数量</TableHead><TableHead>状态</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {details.map((d) => (
                <TableRow key={d.id}>
                  <TableCell><Checkbox checked={checked.includes(d.id)} onCheckedChange={(c) => setChecked(c ? [...checked, d.id] : checked.filter((x) => x !== d.id))} /></TableCell>
                  <TableCell className="font-mono text-xs">{d.no}</TableCell>
                  <TableCell className="text-xs"><div className="font-medium">{d.material}</div><div className="text-muted-foreground font-mono">{d.batch}</div></TableCell>
                  <TableCell className="tabular-nums">{d.qty}</TableCell>
                  <TableCell><StatusBadge value="待上架" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 text-xs text-muted-foreground">已勾选 {checked.length} 行 · 合计 {total} 件</div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="direct" className="gap-1.5"><Layers3 className="h-4 w-4" /> 直接上架</TabsTrigger>
          <TabsTrigger value="call" className="gap-1.5"><Truck className="h-4 w-4" /> 呼叫库内物料</TabsTrigger>
          <TabsTrigger value="regroup" className="gap-1.5"><Layers3 className="h-4 w-4" /> 重新组托上架</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>托盘码 <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input placeholder="扫描或输入托盘码" value={scanned} onChange={(e) => setScanned(e.target.value)} />
                  <Button variant="outline" onClick={() => { setScanned('PT-2611-088'); toast.success('托盘码已录入') }}><ScanLine className="h-4 w-4" /> 扫一扫</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>入库口</Label>
                <Select defaultValue="IN-A07（入库口）">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN-A07（入库口）">IN-A07（入库口）</SelectItem>
                    <SelectItem value="MIX-A08（混用口）">MIX-A08（混用口）</SelectItem>
                    <SelectItem value="CON-B02（接驳口）">CON-B02（接驳口）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled={!checked.length || !scanned}
                onClick={() => toast.success(`直接上架成功：${checked.length} 行 · ${total} 件已下发 WCS`)}>
                确认上架并下发 WCS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="call" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">库内在库托盘</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>SKU-1001 · B-2026001 · 180 件 · 位于 SHIP1</div>
                  <div className="text-warning">AGV 送达中… 预计 2 分钟</div>
                </div>
              </div>
              <Button className="w-full" disabled={!checked.length}
                onClick={() => toast.success('呼叫成功，AGV 已接单，正在送达入库口')}>
                <Truck className="h-4 w-4" /> 确认呼叫
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regroup" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                <div className="font-medium">合并明细说明</div>
                <p className="text-xs text-muted-foreground">
                  原托 180 件 + 新收 {total} 件，将写入同一货位 / 同一托盘，明细自动转「已上架」。
                </p>
              </div>
              <div className="space-y-2">
                <Label>扫码呼叫出的托盘码 <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input placeholder="扫描或输入托盘码" value={scanned} onChange={(e) => setScanned(e.target.value)} />
                  <Button variant="outline" onClick={() => setScanned('PT-2611-042')}><ScanLine className="h-4 w-4" /> 扫一扫</Button>
                </div>
              </div>
              <Button className="w-full" disabled={!checked.length || !scanned}
                onClick={() => toast.success('重新组托上架成功，库存已同步')}>
                确认组托上架
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
