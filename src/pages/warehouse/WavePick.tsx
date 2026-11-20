import { useState } from 'react'
import { toast } from 'sonner'
import { GitBranch, ScanLine, CheckCircle2, Loader2 } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allTable, doAction } from '@/api/adapter'
import type { PickTask } from '@/mock/data'
import { useEffect } from 'react'

export function WavePick() {
  const [tasks, setTasks] = useState<PickTask[]>([])
  const [selected, setSelected] = useState<PickTask | null>(null)
  const [binCode, setBinCode] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [qty, setQty] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    allTable<PickTask>('pickTasks').then((r) => {
      setTasks(r)
      const first = r.find((t) => t.status !== '已拣选')
      setSelected(first || r[0] || null)
      setQty(first?.qty || 0)
    })
  }, [])

  const submit = async () => {
    if (!selected) { toast.error('请先选择待拣任务'); return }
    if (!binCode) { toast.error('请扫描或输入货位码'); return }
    if (!batchCode) { toast.error('请扫描或输入批次码'); return }
    if (binCode !== selected.bin) { toast.error('货位码与任务不一致，服务端将拒绝'); return }
    setSubmitting(true)
    const res = await doAction('pick')
    setSubmitting(false)
    if (res.ok) {
      toast.success(`${res.message}：${selected.no}，已下发任务`)
      setTasks((prev) => prev.map((t) => t.id === selected.id ? { ...t, status: '已拣选', picked: qty } : t))
      setSelected(null); setBinCode(''); setBatchCode('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="波次拣选" description="按巷道顺序合并拣选，扫码确认逐行回写并扣减库存" group="库内作业" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><GitBranch className="h-4 w-4" /> 当前波次待拣任务</span>
              <Badge variant="secondary">{tasks.filter((t) => t.status !== '已拣选').length} 项待拣</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="bg-muted/40">
                <TableHead>波次</TableHead><TableHead>关联订单</TableHead><TableHead>货位</TableHead>
                <TableHead>物料</TableHead><TableHead>批次</TableHead><TableHead>指令数</TableHead><TableHead>状态</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {tasks.slice(0, 12).map((t) => (
                  <TableRow key={t.id}
                    className={`cursor-pointer ${selected?.id === t.id ? 'bg-primary/5' : ''}`}
                    onClick={() => { setSelected(t); setQty(t.qty); setBinCode(''); setBatchCode('') }}>
                    <TableCell className="font-mono text-sm">{t.no}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{t.order}</TableCell>
                    <TableCell className="font-mono text-sm">{t.bin}</TableCell>
                    <TableCell className="text-sm">{t.material}</TableCell>
                    <TableCell className="font-mono text-sm">{t.batch}</TableCell>
                    <TableCell className="tabular-nums">{t.qty}</TableCell>
                    <TableCell><StatusBadge value={t.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">拣选扫码确认</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">已选任务</span><span className="font-mono">{selected.no}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">目标货位</span><span className="font-mono text-info">{selected.bin}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">批次</span><span className="font-mono">{selected.batch}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">指令数量</span><span>{selected.qty}</span></div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><ScanLine className="h-3.5 w-3.5" /> 货位码 <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input placeholder="扫描或输入货位码" value={binCode} onChange={(e) => setBinCode(e.target.value)} />
                    <Button variant="outline" size="icon" onClick={() => setBinCode(selected.bin)}><ScanLine className="h-4 w-4" /></Button>
                  </div>
                  {binCode && <p className={`text-sm ${binCode === selected.bin ? 'text-success' : 'text-destructive'}`}>
                    货位码匹配：{binCode === selected.bin ? '✓ 一致' : '✗ 不一致'}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><ScanLine className="h-3.5 w-3.5" /> 批次码 <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input placeholder="扫描或输入批次码" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} />
                    <Button variant="outline" size="icon" onClick={() => setBatchCode(selected.batch)}><ScanLine className="h-4 w-4" /></Button>
                  </div>
                  {batchCode && <p className={`text-sm ${batchCode === selected.batch ? 'text-success' : 'text-destructive'}`}>
                    批次码匹配：{batchCode === selected.batch ? '✓ 一致' : '✗ 不一致'}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label>实拣数量</Label>
                  <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                  {qty < selected.qty && <p className="text-sm text-warning">短拣：将按缺量流程处理，需填写原因。</p>}
                </div>

                <Button className="w-full" onClick={submit} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> 提交中…</> : <><CheckCircle2 className="h-4 w-4" /> 确认拣选并下发任务</>}
                </Button>
              </>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">请先从左侧选择待拣任务</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
