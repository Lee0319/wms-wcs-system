import { useEffect, useState } from 'react'
import { PackagePlus, ScanLine, CheckCircle2, ArrowRight, Loader2 } from '@/lib/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allTable, doAction } from '@/api/adapter'
import type { InboundOrder } from '@/mock/data'

export function Receiving() {
  const [orders, setOrders] = useState<InboundOrder[]>([])
  const [selected, setSelected] = useState<InboundOrder | null>(null)
  const [step, setStep] = useState(1)
  const [pallet, setPallet] = useState('')
  const [port, setPort] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { allTable<InboundOrder>('inboundOrders').then((r) => {
    setOrders(r)
    setSelected(r.find((o) => o.pending > 0) || r[0] || null)
  }) }, [])

  const submit = async () => {
    if (!pallet) { toast.error('请先扫描或输入托盘码'); return }
    if (!port) { toast.error('请先扫描或输入入库口编码'); return }
    setSubmitting(true)
    const res = await doAction('putaway')
    setSubmitting(false)
    if (res.ok) {
      toast.success(`${res.message}：${selected?.no} 经 ${port} 入 ${pallet}`)
      setStep(1); setPallet(''); setPort('')
    }
  }

  const pendingOrders = orders.filter((o) => o.pending > 0)

  return (
    <div className="space-y-4">
      <PageHeader title="收货与上架" description="物料-巷道绑定 + 就近空位推荐上架货位" group="入库与库存" />

      {/* 步骤条 */}
      <div className="flex items-center gap-2 text-sm">
        {['选择收货单', '上架建议', '扫码录入', '确认上架'].map((label, i) => {
          const n = i + 1
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${step === n ? 'bg-primary text-primary-foreground' : step > n ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                {step > n ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-xs font-medium">{n}</span>}
                <span className="text-xs">{label}</span>
              </div>
              {n < 4 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 收货单列表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><PackagePlus className="h-4 w-4" /> 待上架收货单</span>
              <Badge variant="secondary">{pendingOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setSelected(o); setStep(1) }}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${selected?.id === o.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{o.no}</span>
                    <StatusBadge value={o.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">{o.source} · {o.supplier}</div>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-muted-foreground">{o.arrival}</span>
                    <span className={o.pending > 0 ? 'text-warning' : 'text-success'}>{o.lines} 行 · 待上架 {o.pending} 行</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 上架主区 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{step}</span>
              {['选择收货单', '上架建议', '扫码录入', '确认上架'][step - 1]}
              {selected && <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{selected.no}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">单据来源</span><span>{selected?.source}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">供应商</span><span>{selected?.supplier}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">到货时间</span><span>{selected?.arrival}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">待上架明细</span><span className="font-medium text-warning">{selected?.pending} 行</span></div>
                </div>
                <Button className="w-full" disabled={!selected || selected.pending === 0} onClick={() => setStep(2)}>
                  查看上架建议 <ArrowRight className="h-4 w-4" />
                </Button>
                {selected?.pending === 0 && <p className="text-xs text-center text-muted-foreground">该收货单已无待上架明细，请选择其他单据。</p>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40">
                    <TableHead>物料</TableHead><TableHead>批次 / 数量</TableHead><TableHead>推荐货位</TableHead><TableHead>联动组</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {['SKU-1001', 'SKU-1004', 'SKU-1007'].map((code, i) => (
                      <TableRow key={code}>
                        <TableCell className="text-xs font-medium">{code}</TableCell>
                        <TableCell className="text-xs">B-202600{i + 1} / {200 + i * 50} 件</TableCell>
                        <TableCell><Badge variant="info" className="font-mono">A0{i + 1}A{String(5 + i).padStart(2, '0')}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{i === 1 ? `G-A0${i + 1}-A1 · 第 ${i + 2} 位` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>上一步</Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>下一步：扫码录入 <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><ScanLine className="h-3.5 w-3.5" /> 托盘码 <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input placeholder="扫描或输入托盘码" value={pallet} onChange={(e) => setPallet(e.target.value)} />
                    <Button variant="outline" onClick={() => { setPallet('PT-2611-015'); toast.success('托盘码已录入：PT-2611-015') }}><ScanLine className="h-4 w-4" /> 扫一扫</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">扫码枪可直接扫入输入框并按回车；手机请点「扫一扫」。</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><ScanLine className="h-3.5 w-3.5" /> 入库口编码 <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input placeholder="扫描或输入入库口编码" value={port} onChange={(e) => setPort(e.target.value)} />
                    <Button variant="outline" onClick={() => { setPort('IN-A07'); toast.success('入库口已绑定：IN-A07') }}><ScanLine className="h-4 w-4" /> 扫一扫</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>上一步</Button>
                  <Button className="flex-1" onClick={() => setStep(4)} disabled={!pallet || !port}>下一步：确认 <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-success/5 p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-medium text-success"><CheckCircle2 className="h-4 w-4" /> 确认上架信息</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">收货单</span><span className="font-mono">{selected?.no}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">托盘码</span><span className="font-mono">{pallet}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">入库口</span><span className="font-mono">{port}</span></div>
                </div>
                <p className="text-xs text-muted-foreground">提交后系统自动写库存 / 托盘绑定 / 出入库流水，并下发 WCS 上架任务。</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>上一步</Button>
                  <Button className="flex-1" onClick={submit} disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> 提交中…</> : <><CheckCircle2 className="h-4 w-4" /> 确认上架并下发 WCS</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
