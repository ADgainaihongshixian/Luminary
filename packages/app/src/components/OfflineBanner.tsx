import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'

/**
 * 离线状态 Banner
 * 当网络断开时显示提示
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium backdrop-blur-sm">
      <WifiOff className="size-4" />
      <span>网络已断开，展示的是缓存数据</span>
    </div>
  )
}
