import { Construction } from '@/lib/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">功能开发中</h3>
            <p className="text-sm text-muted-foreground mt-1.5">该页面正在建设，敬请期待。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
