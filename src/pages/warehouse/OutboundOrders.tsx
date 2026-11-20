import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, CheckCircle2 } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Button } from '@/components/ui/button'

const columns: Column[] = [
  { key: 'no', title: '出库订单号', render: (r) => <span className="font-mono text-xs">{r.no}</span> },
  { key: 'customer', title: '客户 / 部门' },
  { key: 'type', title: '订单类型' },
  { key: 'priority', title: '优先级', render: (r) => <StatusBadge value={r.priority} /> },
  { key: 'date', title: '下单日期' },
  { key: 'lines', title: '明细', render: (r) => `${r.lines} 行` },
  { key: 'picked', title: '已拣选', render: (r) => `${r.picked}/${r.lines}` },
  { key: 'status', title: '状态', render: (r) => <StatusBadge value={r.status} /> },
]
const fields: FormField[] = [
  { key: 'no', label: '出库订单号', required: true },
  { key: 'customer', label: '客户 / 部门' },
  { key: 'type', label: '订单类型', options: ['销售出库', '生产领料', '调拨出库'] },
  { key: 'priority', label: '优先级', options: ['高', '中', '低'] },
  { key: 'date', label: '下单日期' },
  { key: 'status', label: '状态', options: ['待分配', '已分配', '待拣选', '已完成'] },
]

export function OutboundOrders() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="出库订单与分配"
        description="按 FIFO 自动匹配批次与货位，预占库存并生成出库任务"
        group="库内作业"
        actions={
          <Button size="sm" onClick={() => toast.success('自动分配完成：已按 FIFO 匹配批次与货位，预占库存并生成出库任务')}>
            <Sparkles className="h-4 w-4" /> 自动分配
          </Button>
        }
      />
      <div className="rounded-lg border bg-info/10 px-4 py-2.5 text-xs text-info">
        FIFO 按入库日期升序分配，锁定批次不参与分配；分配后预占 reserved_qty 并生成拣选任务，出库后自动写流水。
      </div>
      <CrudTable
        table="outboundOrders" columns={columns} searchFields={['no', 'customer', 'type']}
        formFields={fields} exportName="出库订单"
        extraActions={(row) => (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" title="分配"
            onClick={() => toast.success(`${row.no} 已分配，库存已预占`)}>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
      />
    </div>
  )
}
