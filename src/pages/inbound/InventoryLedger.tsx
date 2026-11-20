import { AlertTriangle, CalendarClock } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column } from '@/components/shared/CrudTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ledgerColumns: Column[] = [
  { key: 'binCode', title: '货位', render: (r) => <span className="font-mono text-sm">{r.binCode}</span> },
  { key: 'materialName', title: '物料', render: (r) => <div className="text-sm"><div className="font-medium">{r.materialName}</div><div className="text-xs text-muted-foreground">{r.materialCode}</div></div> },
  { key: 'batch', title: '批次', render: (r) => <span className="font-mono text-sm">{r.batch}</span> },
  { key: 'inDate', title: '入库日期' },
  { key: 'expiry', title: '效期', render: (r) => r.expiry || <span className="text-muted-foreground">—</span> },
  { key: 'qty', title: '数量', render: (r) => <span className="tabular-nums font-medium">{r.qty}</span> },
  { key: 'reserved', title: '预占', render: (r) => <span className="tabular-nums text-muted-foreground">{r.reserved}</span> },
  { key: 'age', title: '库龄(天)', render: (r) => <span className={r.age > 90 ? 'text-destructive font-medium' : r.age > 60 ? 'text-warning' : ''}>{r.age}</span> },
  { key: 'quality', title: '状态', render: (r) => <StatusBadge value={r.quality} /> },
]

const batchColumns: Column[] = [
  { key: 'batch', title: '批次号', render: (r) => <span className="font-mono text-sm">{r.batch}</span> },
  { key: 'materialName', title: '物料' },
  { key: 'inDate', title: '生产/入库日期' },
  { key: 'expiry', title: '效期', render: (r) => r.expiry || '—' },
  { key: 'qty', title: '在库数量', render: (r) => <span className="tabular-nums">{r.qty}</span> },
  { key: 'age', title: '库龄', render: (r) => `${r.age} 天` },
  { key: 'quality', title: '质检状态', render: (r) => <StatusBadge value={r.quality} /> },
]

export function InventoryLedger() {
  return (
    <div className="space-y-4">
      <PageHeader title="库存与批次台账" description="库存台账 / 批次效期 / FIFO 库龄可视化" group="入库与库存" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div><div className="text-xs text-muted-foreground">库龄 &gt; 90 天</div><div className="text-lg font-semibold">需重点关注</div></div>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/5">
          <CardContent className="p-6 flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-info" />
            <div><div className="text-xs text-muted-foreground">近效期批次</div><div className="text-lg font-semibold">FEFO 优先</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><StatusBadge value="合格" /></div>
            <div><div className="text-xs text-muted-foreground">批次管理</div><div className="text-lg font-semibold">按效期排序</div></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">库存台账</TabsTrigger>
          <TabsTrigger value="batch">批次台账</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger" className="mt-4">
          <CrudTable table="inventory" columns={ledgerColumns}
            searchFields={['binCode', 'materialName', 'materialCode', 'batch']} canCreate={false} canEdit={false} canDelete={false} exportName="库存台账" />
        </TabsContent>
        <TabsContent value="batch" className="mt-4">
          <CrudTable table="inventory" columns={batchColumns}
            searchFields={['batch', 'materialName']} canCreate={false} canEdit={false} canDelete={false} exportName="批次台账" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
