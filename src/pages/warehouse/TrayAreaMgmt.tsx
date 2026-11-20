import { useEffect, useState } from 'react'
import { RadioTower, AlertTriangle } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { allTable } from '@/api/adapter'
import type { TrayArea } from '@/mock/data'

const columns: Column[] = [
  { key: 'code', title: '区域编码', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
  { key: 'name', title: '区域名称' },
  { key: 'capacity', title: '容量', render: (r) => <span className="tabular-nums">{r.capacity}</span> },
  { key: 'pallets', title: '现有托盘', render: (r) => <span className="tabular-nums">{r.pallets}</span> },
  { key: 'warning', title: '预警水位', render: (r) => `${r.warning}%` },
  { key: 'usage', title: '水位', render: (r) => {
    const pct = Math.round((r.pallets / r.capacity) * 100)
    return <div className="w-24"><Progress value={pct} className={`h-2 ${pct >= r.warning ? '[&>div]:bg-warning/100' : ''}`} /><span className="text-xs text-muted-foreground">{pct}%</span></div>
  } },
]
const fields: FormField[] = [
  { key: 'code', label: '区域编码', required: true },
  { key: 'name', label: '区域名称' },
  { key: 'capacity', label: '容量', type: 'number' },
  { key: 'warning', label: '预警水位(%)', type: 'number' },
  { key: 'pallets', label: '现有托盘', type: 'number' },
]

export function TrayAreaMgmt() {
  const [areas, setAreas] = useState<TrayArea[]>([])
  useEffect(() => { allTable<TrayArea>('trayAreas').then(setAreas) }, [])
  const warnings = areas.filter((a) => (a.pallets / a.capacity) * 100 >= a.warning)

  return (
    <div className="space-y-4">
      <PageHeader title="托盘区域管理" description="5 个区域容量水位 · 托盘明细 · 移库联动" group="库内作业" />
      {warnings.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {warnings.map((a) => a.code).join('、')} 已达预警水位，请及时处理。
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {areas.map((a) => {
          const pct = Math.round((a.pallets / a.capacity) * 100)
          return (
            <Card key={a.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{a.code}</span>
                  <RadioTower className="h-4 w-4 text-info" />
                </div>
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-xl font-semibold tabular-nums">{pct}%</div>
                <Progress value={pct} className={`h-1.5 ${pct >= a.warning ? '[&>div]:bg-warning/100' : ''}`} />
                <div className="text-[11px] text-muted-foreground">{a.pallets} / {a.capacity} 托盘</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <CrudTable table="trayAreas" columns={columns} searchFields={['code', 'name']} formFields={fields} exportName="托盘区域" />
    </div>
  )
}
