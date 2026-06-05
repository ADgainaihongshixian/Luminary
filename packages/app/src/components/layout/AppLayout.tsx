import { MobileNav } from './MobileNav'
import { TopNav } from './TopNav'
import { MobileDropdown } from './MobileDropdown'
import { OfflineBanner } from '@/components/OfflineBanner'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * 应用主布局容器
 * - PC 端：顶部导航栏（Logo + 导航标签 + 主题切换 + 设置）
 * - 移动端：顶部 Logo + 主题切换 + 设置 + 底部 Tab Bar
 * - 离线时显示 Banner
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* PC 端顶栏 */}
      <TopNav />

      {/* 移动端下拉菜单 */}
      <MobileDropdown />

      {/* 离线提示 */}
      <OfflineBanner />

      {/* 主内容区 - 顶部留出顶栏空间，底部留出 Tab Bar 空间 */}
      <main className="pt-14 pb-16 md:pb-0">{children}</main>

      {/* 移动端底部导航 */}
      <MobileNav />
    </div>
  )
}
