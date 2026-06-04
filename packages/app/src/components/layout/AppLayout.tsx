import { MobileNav } from './MobileNav'
import { OfflineBanner } from '@/components/OfflineBanner'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * 应用主布局容器
 * - 移动端：底部 Tab Bar + 底部安全区
 * - PC 端：正常布局（Tab Bar 隐藏）
 * - 离线时显示 Banner
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 离线提示 */}
      <OfflineBanner />

      {/* 主内容区 - 移动端底部留出 Tab Bar 空间 */}
      <main className="pb-16 md:pb-0">{children}</main>

      {/* 移动端底部导航 */}
      <MobileNav />
    </div>
  )
}
