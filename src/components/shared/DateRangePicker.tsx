import { useMemo, useState } from 'react'
import {
  addMonths, eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameDay,
  isSameMonth, startOfDay, startOfMonth, subDays, subMonths,
} from 'date-fns'
import { CalendarClock, ChevronLeft, ChevronRight } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRangeValue {
  from: string
  to: string
}

const toDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : undefined)
const toStr = (d: Date) => format(d, 'yyyy-MM-dd')
const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 周一为一周起始，返回该月日历所需的格子（含前置空位） */
function monthCells(month: Date) {
  const first = startOfMonth(month)
  const days = eachDayOfInterval({ start: first, end: endOfMonth(month) })
  const lead = (first.getDay() + 6) % 7
  const blanks: (Date | null)[] = Array.from({ length: lead }, () => null)
  const all: (Date | null)[] = [...blanks, ...days]
  while (all.length % 7 !== 0) all.push(null)
  return all
}

interface Props {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [draft, setDraft] = useState<DateRangeValue>(value)
  const [hover, setHover] = useState<Date | undefined>()

  const from = toDate(draft.from)
  const to = toDate(draft.to)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value)
      setMonth(startOfMonth(value.from ? toDate(value.from)! : new Date()))
      setHover(undefined)
    }
    setOpen(next)
  }

  const pick = (day: Date) => {
    if (!from || (from && to)) {
      setDraft({ from: toStr(day), to: '' })
      return
    }
    if (isBefore(day, from)) {
      setDraft({ from: toStr(day), to: '' })
      return
    }
    setDraft({ from: draft.from, to: toStr(day) })
  }

  const preset = (days: number) => {
    const end = startOfDay(new Date())
    setDraft({ from: toStr(subDays(end, days - 1)), to: toStr(end) })
    setMonth(startOfMonth(subDays(end, days - 1)))
  }

  const apply = () => {
    onChange(draft)
    setOpen(false)
  }

  const clear = () => {
    setDraft({ from: '', to: '' })
    onChange({ from: '', to: '' })
    setOpen(false)
  }

  const months = useMemo(() => [month, addMonths(month, 1)], [month])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('w-[18rem] justify-start gap-2 font-normal tabular-nums', !value.from && 'text-muted-foreground', className)}
        >
          <CalendarClock className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {value.from && value.to
              ? `${value.from} - ${value.to}`
              : value.from ? `${value.from} - 结束日期` : '起始日期 - 结束日期'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => preset(7)}>近 7 天</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => preset(30)}>近 30 天</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {
              const now = new Date()
              setDraft({ from: toStr(startOfMonth(now)), to: toStr(now) })
              setMonth(startOfMonth(now))
            }}>本月</Button>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {months.map((m) => (
            <div key={m.toISOString()} className="w-[13.5rem]">
              <p className="mb-1.5 text-center text-sm font-medium">{format(m, 'yyyy 年 M 月')}</p>
              <div className="grid grid-cols-7">
                {WEEK_LABELS.map((w) => (
                  <span key={w} className="flex h-8 items-center justify-center text-xs text-muted-foreground">{w}</span>
                ))}
                {monthCells(m).map((day, i) => {
                  if (!day) return <span key={`b${i}`} className="h-8" />
                  const selectedFrom = from && isSameDay(day, from)
                  const selectedTo = to && isSameDay(day, to)
                  const inRange = from && to && isAfter(day, from) && isBefore(day, to)
                  const hoverRange = from && !to && hover && isAfter(day, from) && isBefore(day, hover)
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => pick(day)}
                      onMouseEnter={() => setHover(day)}
                      className={cn(
                        'relative flex h-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSameMonth(day, m) ? 'text-foreground' : 'text-muted-foreground',
                        (selectedFrom || selectedTo) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        (inRange || hoverRange) && 'bg-primary/10',
                        !from && !to && isSameDay(day, new Date()) && 'font-semibold text-primary'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="text-xs text-muted-foreground">
            {from ? (to ? `${format(from, 'M 月 d 日')} 至 ${format(to, 'M 月 d 日')}` : '请选择结束日期') : '请选择起始日期'}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clear}>清除</Button>
            <Button size="sm" className="h-7 px-3 text-xs" onClick={apply} disabled={!from || !to}>确定</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
