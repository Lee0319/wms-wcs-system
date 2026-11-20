import { toast } from 'sonner'
import { ArrowLeftRight, GitMerge, Loader2 } from '@/lib/icons'
import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { doAction } from '@/api/adapter'

export function PalletMove() {
  const [submitting, setSubmitting] = useState(false)
  const move = async () => {
    setSubmitting(true)
    await doAction('move')
    setSubmitting(false)
    toast.success('移库成功，货位占用已更新，已写移库流水')
  }
  return (
    <div className="space-y-4">
      <PageHeader title="托盘移库（同面归并）" description="同物料归并到主库面 · 堆垛机倒库任务可视化" group="库内作业" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> 移库登记</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>托盘码 <span className="text-destructive">*</span></Label><Input placeholder="如 PT-2611-015" defaultValue="PT-2611-015" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>源货位</Label><Input defaultValue="A01A05" /></div>
              <div className="space-y-2"><Label>目标货位</Label><Input placeholder="如 A01A08" /></div>
            </div>
            <div className="space-y-2">
              <Label>移库原因</Label>
              <Select defaultValue="merge">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">同面同排归并</SelectItem>
                  <SelectItem value="expiry">效期批次集中</SelectItem>
                  <SelectItem value="clear">腾出连续空位</SelectItem>
                  <SelectItem value="count">盘点临时倒库</SelectItem>
                  <SelectItem value="manual">人工指定</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={move} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> 处理中…</> : <><ArrowLeftRight className="h-4 w-4" /> 确认移库</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><GitMerge className="h-4 w-4" /> 同面归并建议</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { mat: 'SKU-1001 冷轧钢卷', from: 'A01A12', to: 'A01A05', qty: 180 },
              { mat: 'SKU-1004 铝型材', from: 'A02B09', to: 'A02B03', qty: 150 },
              { mat: 'SKU-1007 伺服电机', from: 'A03A18', to: 'A03A06', qty: 80 },
            ].map((r, i) => (
              <div key={i} className="rounded-lg border p-3 flex items-center justify-between">
                <div className="text-xs space-y-1">
                  <div className="font-medium">{r.mat}</div>
                  <div className="text-muted-foreground font-mono">{r.from} → {r.to}</div>
                </div>
                <div className="text-right">
                  <Badge variant="info">{r.qty} 件</Badge>
                  <Button variant="link" size="sm" className="block ml-auto h-6 text-xs" onClick={move}>归并</Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">归并后源货位释放，已下发堆垛机倒库任务。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
