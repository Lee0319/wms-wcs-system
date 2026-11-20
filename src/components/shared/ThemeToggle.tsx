import { Sun, Moon } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/store/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={isDark ? '切换到浅色模式' : '切换到暗色模式'}
      aria-label={isDark ? '切换到浅色模式' : '切换到暗色模式'}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
