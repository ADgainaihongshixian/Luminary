import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  /** 最大宽度，默认 5xl（1024px）；表单类页面可用 3xl */
  size?: '5xl' | '3xl' | '2xl'
  className?: string
}

const SIZE_MAP = {
  '5xl': 'max-w-5xl',
  '3xl': 'max-w-3xl',
  '2xl': 'max-w-2xl',
}

/**
 * 通用页面容器
 * 统一 padding、最大宽度、居中
 */
export function PageContainer({ children, size = '5xl', className }: PageContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6', SIZE_MAP[size], className)}>{children}</div>
  )
}
