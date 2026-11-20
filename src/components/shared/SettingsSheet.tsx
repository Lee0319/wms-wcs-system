import { useState } from 'react'
import { Check, SlidersHorizontal } from '@/lib/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useSidebarMode, SIDEBAR_VARIANT_OPTIONS, type SidebarVariant } from '@/store/sidebar-mode'
import { cn } from '@/lib/utils'

/** 迷你布局示意图 —— 全用语义 token */
function VariantPreview({ variant }: { variant: SidebarVariant }) {
  return (
    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border bg-muted/40">
      {variant === 'sidebar' && (
        <>
          <div className="absolute inset-y-0 left-0 w-4 border-r bg-muted-foreground/20" />
          <div className="absolute inset-y-0 left-4 right-0 bg-background" />
        </>
      )}
      {variant === 'floating' && (
        <>
          <div className="absolute inset-y-1 left-1 w-3.5 rounded-sm border bg-background shadow-sm" />
          <div className="absolute inset-y-1 left-5 right-1 rounded-sm border bg-background" />
        </>
      )}
      {variant === 'inset' && (
        <>
          <div className="absolute inset-0 bg-muted/70" />
          <div className="absolute inset-y-1 left-1 w-3.5 rounded-sm bg-transparent" />
          <div className="absolute inset-y-1 left-5 right-1 rounded-sm border bg-background shadow-sm" />
        </>
      )}
    </div>
  )
}

export function SettingsSheet() {
  const [open, setOpen] = useState(false)
  const { variant, setVariant } = useSidebarMode()

  const choose = (v: SidebarVariant) => {
    setVariant(v)
    toast.success(`侧栏样式已切换为「${SIDEBAR_VARIANT_OPTIONS.find((o) => o.value === v)?.label}」`)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="界面设置"
        aria-label="界面设置"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[22rem] sm:max-w-[22rem]">
          <SheetHeader>
            <SheetTitle>界面设置</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            <div>
              <div className="text-sm font-medium">侧栏样式</div>
              <p className="mt-1 text-xs text-muted-foreground">
                选择左侧导航栏的布局形态，设置会自动保存。
              </p>
            </div>

            <div className="space-y-2">
              {SIDEBAR_VARIANT_OPTIONS.map((opt) => {
                const active = variant === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => choose(opt.value)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-accent'
                    )}
                  >
                    <VariantPreview variant={opt.value} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{opt.label}</span>
                        {active && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <Separator />

            <p className="text-xs leading-relaxed text-muted-foreground">
              切换到「贴边 sidebar」或「浮动 floating」后，内容区将不再显示为圆角卡片；
              「内嵌 inset」会保留页面浅灰底与白色内容卡片。
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
