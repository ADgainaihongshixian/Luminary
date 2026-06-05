import { NavLink, Link } from 'react-router-dom'
import { Settings as SettingsIcon, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants/nav'

/** PC 端持久顶栏：Logo + 导航标签 + 主题切换 + 设置 */
export function TopNav() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  // PC 端顶栏不显示"设置"，设置通过右侧图标进入
  const navItems = NAV_ITEMS.filter((item) => item.path !== '/settings')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-lg border-b border-border hidden md:flex items-center px-6">
      {/* 左侧 Logo */}
      <Link to="/" className="flex items-center gap-2 mr-8 shrink-0">
        <span className="text-xl font-bold text-gradient">流光</span>
      </Link>

      {/* 中间导航标签 */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )
            }
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

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
