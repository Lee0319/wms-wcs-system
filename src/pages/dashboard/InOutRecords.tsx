import { ArrowDownToLine, ArrowUpFromLine } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const inColumns: Column[] = [
  { key: 'no', title: '收货单号', render: (r) => <span className="font-mono text-xs">{r.no}</span> },
  { key: 'source', title: '单据来源' },
  { key: 'supplier', title: '来源供应商' },
  { key: 'arrival', title: '到货时间' },
  { key: 'lines', title: '明细行数', render: (r) => `${r.lines} 行` },
  { key: 'pending', title: '待上架', render: (r) => `${r.pending} 行` },
  { key: 'status', title: '状态', render: (r) => <StatusBadge value={r.status} /> },
]
const outColumns: Column[] = [
  { key: 'no', title: '出库订单号', render: (r) => <span className="font-mono text-xs">{r.no}</span> },
  { key: 'customer', title: '客户 / 部门' },
  { key: 'type', title: '订单类型' },
  { key: 'priority', title: '优先级', render: (r) => <StatusBadge value={r.priority} /> },
  { key: 'date', title: '下单日期' },
  { key: 'picked', title: '已拣选', render: (r) => `${r.picked}/${r.lines}` },
  { key: 'status', title: '状态', render: (r) => <StatusBadge value={r.status} /> },
]
const inFields: FormField[] = [
  { key: 'no', label: '收货单号', required: true },
  { key: 'source', label: '单据来源', options: ['供应商送货', '生产完工入库', '退货入库', '调拨入库'] },
  { key: 'supplier', label: '供应商' },
  { key: 'arrival', label: '到货时间' },
  { key: 'lines', label: '明细行数', type: 'number' },
  { key: 'status', label: '状态', options: ['待上架', '部分上架', '已上架'] },
]
const outFields: FormField[] = [
  { key: 'no', label: '出库订单号', required: true },
  { key: 'customer', label: '客户 / 部门' },
  { key: 'type', label: '订单类型', options: ['销售出库', '生产领料', '调拨出库'] },
  { key: 'priority', label: '优先级', options: ['高', '中', '低'] },
  { key: 'date', label: '下单日期' },
  { key: 'status', label: '状态', options: ['待分配', '已分配', '待拣选', '已完成'] },
]

export function InOutRecords() {
  return (
    <div className="space-y-4">
      <PageHeader title="出入库记录" description="当前账期流水 · 收货单与出库订单" group="我的工作台" />
      <Tabs defaultValue="inbound">
        <TabsList>
          <TabsTrigger value="inbound" className="gap-1.5"><ArrowDownToLine className="h-4 w-4" /> 收货单</TabsTrigger>
          <TabsTrigger value="outbound" className="gap-1.5"><ArrowUpFromLine className="h-4 w-4" /> 出库订单</TabsTrigger>
        </TabsList>
        <TabsContent value="inbound" className="mt-4">
          <CrudTable table="inboundOrders" columns={inColumns} searchFields={['no', 'supplier', 'source']} formFields={inFields} exportName="收货单" />
        </TabsContent>
        <TabsContent value="outbound" className="mt-4">
          <CrudTable table="outboundOrders" columns={outColumns} searchFields={['no', 'customer', 'type']} formFields={outFields} exportName="出库订单" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
