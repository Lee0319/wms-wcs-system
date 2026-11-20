import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, Warehouse, Box } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { allTable } from '@/api/adapter'
import type { Aisle, Bin } from '@/mock/data'
import { cn } from '@/lib/utils'

export function AisleMonitor() {
  const [aisles, setAisles] = useState<Aisle[]>([])
  const [bins, setBins] = useState<Bin[]>([])
  const [selected, setSelected] = useState<string>('A01')

  useEffect(() => {
    allTable<Aisle>('aisles').then((r) => { setAisles(r); if (r[0]) setSelected(r[0].code) })
    allTable<Bin>('bins').then(setBins)
  }, [])

  const aisleBins = bins.filter((b) => b.aisle === selected).slice(0, 40)

  return (
    <div className="space-y-4">
      <PageHeader title="巷道监控（左进右出）" description="巷道内货位占用可视化 · 堆垛机状态 / 负载" group="库内作业" />

      <div className="flex flex-wrap gap-2">
        {aisles.slice(0, 10).map((a) => (
          <Button key={a.id} variant={selected === a.code ? 'default' : 'outline'} size="sm" onClick={() => setSelected(a.code)}>
            {a.code}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Warehouse className="h-4 w-4" /> {selected} 巷道货位视图</CardTitle>
            <CardDescription>入库口在左端、出库口在右端，堆垛机单向作业</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Badge variant="info" className="gap-1"><ArrowRight className="h-3 w-3" /> 入库端</Badge>
              <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-info/30 via-border to-success/30" />
              <Badge variant="success" className="gap-1">出库端 <ArrowRight className="h-3 w-3" /></Badge>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {aisleBins.map((b) => (
                <div
                  key={b.id}
                  title={`${b.code} · ${b.status}`}
                  className={cn(
                    'aspect-square rounded-md border flex flex-col items-center justify-center text-[9px] gap-0.5 cursor-default transition-colors',
                    b.status === '在库' && 'bg-success/15 border-success/40 text-success',
                    b.status === '空货位' && 'bg-muted border-border text-muted-foreground',
                    b.status === '锁定' && 'bg-warning/15 border-warning/40 text-warning',
                    b.status === '拣选中' && 'bg-info/15 border-info/40 text-info',
                    b.status === '返库中' && 'bg-chart-4/15 border-chart-4/40 text-chart-4',
                    b.status === '停用' && 'bg-muted border-border text-muted-foreground',
                  )}
                >
                  <Box className="h-3 w-3" />
                  <span className="font-mono">{b.face}{String(b.column).padStart(2, '0')}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t text-sm">
              {[
                ['在库', 'bg-success/15 border-success/40'], ['空货位', 'bg-muted border-border'],
                ['锁定', 'bg-warning/15 border-warning/40'], ['拣选中', 'bg-info/15 border-info/40'],
                ['返库中', 'bg-chart-4/15 border-chart-4/40'], ['停用', 'bg-muted border-border'],
              ].map(([label, cls]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={cn('h-3 w-3 rounded border', cls)} /> {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">巷道信息</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(() => {
              const a = aisles.find((x) => x.code === selected)
              if (!a) return <div className="text-muted-foreground">加载中…</div>
              return (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">巷道编码</span><span className="font-mono">{a.code}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">所属库区</span><span>{a.zone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">绑定物料</span><span className="font-mono text-sm">{a.material}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">作业方向</span><StatusBadge value={a.direction} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">堆垛机</span><span>{a.stacker || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">货位数</span><span>{a.binCount}</span></div>
                  <div className="pt-3 border-t mt-3">
                    <div className="text-sm text-muted-foreground mb-1.5">堆垛机状态</div>
                    <div className="flex items-center justify-between"><StatusBadge value="运行" /><span className="text-sm text-muted-foreground">负载 62%</span></div>
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
