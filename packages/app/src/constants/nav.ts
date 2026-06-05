import { Home, TrendingUp, Gem, Bell, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/funds', label: '基金', icon: TrendingUp },
  { path: '/metals', label: '贵金属', icon: Gem },
  { path: '/alerts', label: '预警', icon: Bell },
  { path: '/settings', label: '设置', icon: Settings },
] as const
