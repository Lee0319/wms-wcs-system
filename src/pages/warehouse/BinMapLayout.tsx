import { useState } from 'react'
import {
  Grid3X3, Route, MousePointer2, Save, RotateCcw, Trash2, Eye, EyeOff,
  Square, MoveHorizontal, Layers3,
} from '@/lib/icons'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { doAction } from '@/api/adapter'
import { cn } from '@/lib/utils'

type Brush = 'bin' | 'channel' | 'mixed'
type CellType = 'empty' | 'bin' | 'channel'

const ROWS = 8
const COLS = 12

function makeGrid(): CellType[][] {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      if (r === 3 || r === 4) return 'channel'
      return (r + c) % 3 === 0 ? 'empty' : 'bin'
    })
  )
}

export function BinMapLayout() {
  const [grid, setGrid] = useState<CellType[][]>(makeGrid)
  const [brush, setBrush] = useState<Brush>('bin')
  const [showBins, setShowBins] = useState(true)
  const [painting, setPainting] = useState(false)

  const paint = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row])
      if (brush === 'channel') next[r][c] = 'channel'
      else if (brush === 'mixed') next[r][c] = (r + c) % 2 === 0 ? 'bin' : 'channel'
      else next[r][c] = 'bin'
      return next
    })
  }

  const save = async () => {
    await doAction('saveMap')
    toast.success(`库位图已保存：${ROWS} 行 × ${COLS} 列`)
  }

  const autoLayout = () => {
    setGrid(makeGrid())
    toast.success('已按「A 面 / AGV 取货通道 / B 面」自动排布')
  }

  const clear = () => {
    setGrid(Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 'empty' as CellType)))
    toast.success('画布已清空，库位已回到左侧库位池')
  }

  const binCount = grid.flat().filter((c) => c === 'bin').length
  const channelCount = grid.flat().filter((c) => c === 'channel').length

  return (
    <div className="space-y-4">
      <PageHeader title="库位图布局器" description="拖拽排布 · AGV 通道画笔 · 库位池联动 · 保存图纸" group="库内作业"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowBins(!showBins)}>
              {showBins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showBins ? '隐藏' : '显示'}联动组
            </Button>
            <Button size="sm" onClick={save}><Save className="h-4 w-4" /> 保存图纸</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* 工具栏 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MousePointer2 className="h-4 w-4" /> 画笔工具</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">画笔类型</Label>
              <div className="grid gap-2">
                {[
                  { key: 'bin' as Brush, label: '库位格', icon: Square, cls: 'bg-success/15 border-success/40 text-success' },
                  { key: 'channel' as Brush, label: '⇄ AGV 通道', icon: MoveHorizontal, cls: 'bg-info/15 border-info/40 text-info' },
                  { key: 'mixed' as Brush, label: '通道 + 库位混合', icon: Layers3, cls: 'bg-warning/15 border-warning/40 text-warning' },
                ].map(({ key, label, icon: Icon, cls }) => (
                  <button key={key} onClick={() => setBrush(key)}
                    className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                      brush === key ? cn(cls, 'ring-2 ring-primary/30') : 'bg-background hover:bg-accent')}>
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">选择画笔后在画布上按住拖动绘制。右键可切回库位格。</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">图纸设置</Label>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px] text-muted-foreground">行</Label><Input className="h-8" defaultValue={ROWS} readOnly /></div>
                <div><Label className="text-[10px] text-muted-foreground">列</Label><Input className="h-8" defaultValue={COLS} readOnly /></div>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={autoLayout}>
                <Grid3X3 className="h-4 w-4" /> 自动排布
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={clear}>
                <Trash2 className="h-4 w-4" /> 清空画布
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start"
                onClick={() => { setGrid(makeGrid()); toast.success('已清除保存的图纸，恢复默认排布') }}>
                <RotateCcw className="h-4 w-4" /> 恢复默认
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="font-medium flex items-center gap-1.5"><Route className="h-3.5 w-3.5" /> 统计</div>
              <div className="flex justify-between"><span className="text-muted-foreground">库位格</span><Badge variant="success">{binCount}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">AGV 通道格</span><Badge variant="info">{channelCount}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">已排布货位</span><span>{binCount}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* 画布 */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>库位图 · {ROWS} 行 × {COLS} 列</span>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-success/40 bg-success/15" /> 库位格</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-info/40 bg-info/15" /> AGV 通道</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-border bg-muted" /> 空位</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/20 p-3 overflow-x-auto"
              onMouseLeave={() => setPainting(false)}
              onContextMenu={(e) => e.preventDefault()}>
              <div className="min-w-[720px] space-y-1.5">
                {grid.map((row, r) => (
                  <div key={r} className="flex items-center gap-1.5">
                    <span className="w-6 text-[10px] text-muted-foreground text-right shrink-0">{String(r + 1).padStart(2, '0')}</span>
                    {row.map((cell, c) => (
                      <button
                        key={c}
                        onMouseDown={(e) => { e.preventDefault(); setPainting(true); paint(r, c) }}
                        onMouseEnter={() => painting && paint(r, c)}
                        onContextMenu={(e) => { e.preventDefault(); setBrush('bin'); }}
                        title={`${String.fromCharCode(65 + r)}${String(c + 1).padStart(2, '0')} · ${cell === 'bin' ? '库位格' : cell === 'channel' ? 'AGV 通道' : '空位'}`}
                        className={cn(
                          'h-8 flex-1 rounded border text-[9px] font-mono transition-colors flex items-center justify-center',
                          cell === 'bin' && 'bg-success/15 border-success/40 text-success hover:bg-success/25',
                          cell === 'channel' && 'bg-info/15 border-info/40 text-info hover:bg-info/25',
                          cell === 'empty' && 'bg-background border-border text-muted-foreground hover:bg-accent',
                        )}
                      >
                        {cell === 'channel' ? '⇄' : cell === 'bin' ? (showBins ? `A${String(r + 1).padStart(2, '0')}${String(c + 1).padStart(2, '0')}` : '·') : ''}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>A 面 / AGV 取货通道 / B 面 · 通道左右两端进出</span>
              <Button variant="link" size="sm" className="h-6 text-sm" onClick={autoLayout}>按默认规则重新排布</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
