import { IconType, TrendingUp, TrendingDown } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string | number
  icon: IconType
  hint?: string
  trend?: number
  tone?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
}

const toneMap = {
  blue: 'bg-info/10 text-info',
  green: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  purple: 'bg-chart-4/10 text-chart-4',
  red: 'bg-destructive/10 text-destructive',
}

export function StatCard({ title, value, icon: Icon, hint, trend, tone = 'blue' }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneMap[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {(hint || trend !== undefined) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend !== undefined && (
              <span className={cn('inline-flex items-center gap-0.5 font-medium', trend >= 0 ? 'text-success' : 'text-destructive')}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
            {hint && <span>{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
