import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarVariant = 'sidebar' | 'floating' | 'inset'

interface SidebarModeState {
  variant: SidebarVariant
  setVariant: (variant: SidebarVariant) => void
}

export const useSidebarMode = create<SidebarModeState>()(
  persist(
    (set) => ({
      variant: 'inset',
      setVariant: (variant) => set({ variant }),
    }),
    { name: 'wms_sidebar_variant' }
  )
)

export const SIDEBAR_VARIANT_OPTIONS: {
  value: SidebarVariant
  label: string
  desc: string
}[] = [
  { value: 'inset', label: '内嵌 inset', desc: '页面浅灰底，内容区为白色圆角卡片' },
  { value: 'sidebar', label: '贴边 sidebar', desc: '侧栏贴边，右侧边框分隔内容区' },
  { value: 'floating', label: '浮动 floating', desc: '侧栏留白、圆角与阴影，像悬浮卡片' },
]
