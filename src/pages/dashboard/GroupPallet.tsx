import { useState } from 'react'
import { Boxes, Plus, Link2, Unlink2 } from '@/lib/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const columns: Column[] = [
  { key: 'code', title: '托盘号', render: (r) => <span className="font-mono text-sm">{r.code}</span> },
  { key: 'type', title: '托盘类型' },
  { key: 'area', title: '所在区域' },
  { key: 'material', title: '绑定物料', render: (r) => r.material || <span className="text-muted-foreground">未绑定</span> },
  { key: 'batch', title: '批次', render: (r) => r.batch || '—' },
  { key: 'qty', title: '数量', render: (r) => <span className="tabular-nums">{r.qty}</span> },
  { key: 'status', title: '状态', render: (r) => <StatusBadge value={r.status} /> },
  { key: 'stay', title: '区域停留', render: (r) => `${r.stay} 天` },
]
const formFields: FormField[] = [
  { key: 'code', label: '托盘号', required: true, placeholder: '如 PT-2611-015' },
  { key: 'type', label: '托盘类型', options: ['木质', '塑料', '金属'] },
  { key: 'area', label: '所在区域', options: ['SHIP1', 'SHIP2', 'EMPTY1', 'PICK1', 'INSPECT'] },
  { key: 'material', label: '物料', placeholder: '物料编码' },
  { key: 'batch', label: '批次', placeholder: '批次号' },
  { key: 'qty', label: '数量', type: 'number' },
  { key: 'status', label: '状态', options: ['可用', '空托盘', '占用', '锁定'] },
]

export function GroupPallet() {
  const [selected, setSelected] = useState<any[]>([])
  return (
    <div className="space-y-4">
      <PageHeader title="组盘管理" description="托盘绑定物料 / 批次 / 数量 · 组盘拆盘同步库存" group="我的工作台" />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <CrudTable
            table="pallets"
            columns={columns}
            searchFields={['code', 'material', 'batch', 'area']}
            formFields={formFields}
            canCreate
            toolbarExtra={
              <Button size="sm" variant="outline" onClick={() => toast.success('组盘成功，已同步库存')}>
                <Link2 className="h-4 w-4" /> 组盘
              </Button>
            }
            extraActions={(row) => (
              <Button variant="ghost" size="icon" className="h-8 w-8" title="拆盘"
                onClick={() => toast.success(`${row.code} 已拆盘`)}>
                <Unlink2 className="h-3.5 w-3.5" />
              </Button>
            )}
          />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Boxes className="h-4 w-4" /> 组盘说明</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p>组盘将一个托盘与物料、批次、数量绑定，并同步写入库存台账。</p>
            <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">1</span>选择目标托盘</div>
              <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">2</span>绑定物料与批次</div>
              <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">3</span>确认组盘同步库存</div>
            </div>
            <Button size="sm" className="w-full" onClick={() => toast.success('已进入新建组盘流程')}>
              <Plus className="h-4 w-4" /> 新建组盘
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
