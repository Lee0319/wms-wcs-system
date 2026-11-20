import { toast } from 'sonner'
import { Truck, Plus } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Button } from '@/components/ui/button'

const columns: Column[] = [
  { key: 'no', title: '呼叫单号', render: (r) => <span className="font-mono text-xs">{r.no}</span> },
  { key: 'type', title: '呼叫类型' },
  { key: 'source', title: '来源', render: (r) => <span className="font-mono text-xs">{r.source}</span> },
  { key: 'target', title: '目标', render: (r) => <span className="font-mono text-xs">{r.target}</span> },
  { key: 'material', title: '物料', render: (r) => <span className="font-mono text-xs">{r.material}</span> },
  { key: 'status', title: '状态', render: (r) => <StatusBadge value={r.status} /> },
  { key: 'time', title: '时间' },
]
const fields: FormField[] = [
  { key: 'no', label: '呼叫单号', required: true },
  { key: 'type', label: '呼叫类型', options: ['空托盘补给', '满托盘运出', '拣选托盘需求', '发货托盘需求', '按物料呼叫'] },
  { key: 'source', label: '来源货位' },
  { key: 'target', label: '目标区域', options: ['PICK1', 'SHIP1', 'IN-A07'] },
  { key: 'material', label: '物料编码' },
  { key: 'status', label: '状态', options: ['待响应', 'AGV 已接单', '搬运中', '已完成', '已取消'] },
]

export function PalletCall() {
  return (
    <div className="space-y-4">
      <PageHeader title="托盘呼叫" description="四类呼叫单 · WCS 自动派 AGV · 状态全程可视" group="库内作业"
        actions={<Button size="sm" onClick={() => toast.success('已创建呼叫单，WCS 正在派单')}><Plus className="h-4 w-4" /> 新建呼叫</Button>} />
      <div className="grid gap-3 sm:grid-cols-4">
        {['空托盘补给', '满托盘运出', '拣选托盘需求', '按物料呼叫'].map((t) => (
          <div key={t} className="rounded-lg border bg-card p-3 flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-info" /> {t}
          </div>
        ))}
      </div>
      <CrudTable table="calls" columns={columns} searchFields={['no', 'type', 'material']} formFields={fields} exportName="托盘呼叫" />
    </div>
  )
}
