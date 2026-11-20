import type { TooltipProps } from 'recharts'

interface ChartTooltipProps extends TooltipProps<number, string> {
  /** 数值后缀，例如饼图传 "%" */
  valueSuffix?: string
}

/**
 * 跟随主题（浅色/暗色）的图表悬浮提示框。
 * 使用 shadcn 语义色（popover / border / muted-foreground），
 * 不使用 Recharts 内置的白色默认样式。
 */
export function ChartTooltip({ active, payload, label, valueSuffix = '' }: ChartTooltipProps) {
  const rows = (payload ?? []).filter((row) => !row.hide)
  if (!active || rows.length === 0) return null

  return (
    <div className="pointer-events-none rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      {label !== undefined && label !== null && label !== '' ? (
        <div className="mb-1.5 font-medium text-muted-foreground">{String(label)}</div>
      ) : null}
      <div className="space-y-1">
        {rows.map((row, index) => (
          <div key={`${String(row.dataKey ?? row.name ?? '')}-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? row.payload?.fill ?? 'hsl(var(--muted-foreground))' }}
              />
              <span>{row.name}</span>
            </span>
            <span className="font-medium tabular-nums">
              {Array.isArray(row.value) ? row.value.join('–') : row.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
