import { Link } from 'react-router-dom'
import { Settings as SettingsIcon, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

/**
 * 移动端顶部导航
 * Logo + 主题切换 + 设置，与 PC 端样式保持一致
 */
export function MobileDropdown() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-lg border-b border-border md:hidden flex items-center px-4">
      {/* 左侧 Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold text-gradient">流光</span>
      </Link>

      {/* 右侧操作 */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          title={`当前：${theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '跟随系统'}，点击切换`}
        >
          <ThemeIcon className="size-4" />
        </Button>
        <Link to="/settings">
          <Button variant="ghost" size="icon" title="设置">
            <SettingsIcon className="size-4" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
