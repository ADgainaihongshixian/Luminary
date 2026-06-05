import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateAction {
  /** 按钮文案 */
  label: string
  /** 点击回调 */
  onClick: () => void
  /** 按钮图标（可选） */
  icon?: LucideIcon
}

interface EmptyStateProps {
  /** 图标组件 */
  icon: LucideIcon
  /** 标题 */
  title: string
  /** 描述文案 */
  description?: string
  /** 操作按钮 */
  action?: EmptyStateAction
  /** 图标背景色变体 */
  variant?: 'primary' | 'accent' | 'muted'
}

/**
 * 通用空态引导组件
 * 用于列表为空或无数据时的引导展示
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'primary',
}: EmptyStateProps) {
  const bgClass = {
    primary: 'bg-primary/10',
    accent: 'bg-accent/10',
    muted: 'bg-muted/30',
  }[variant]

  const iconClass = {
    primary: 'text-primary',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
  }[variant]

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`w-16 h-16 rounded-full ${bgClass} flex items-center justify-center mb-4`}>
        <Icon className={`size-8 ${iconClass}`} />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-muted-foreground text-sm mb-6 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.icon && <action.icon className="size-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
