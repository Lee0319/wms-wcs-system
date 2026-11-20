import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface Props {
  title: string
  description?: string
  group?: string
  actions?: ReactNode
  perm?: string
}

export function PageHeader({ title, description, group, actions, perm }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {perm && <Badge variant="outline" className="text-[10px] font-mono">{perm}</Badge>}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {group && <><span>{group}</span><span>/</span></>}
          <span>{description || title}</span>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
