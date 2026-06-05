import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NumberRoller } from '@/components/motion/NumberRoller'

interface ChangeIndicatorProps {
  /** 变化值（正数表示涨，负数表示跌） */
  value: number | undefined | null
  /** 小数位数 */
  decimals?: number
  /** 前缀（如 "+"） */
  prefix?: string
  /** 后缀（如 "%"） */
  suffix?: string
  /** 是否显示趋势图标 */
  showIcon?: boolean
  /** 图标大小 */
  iconSize?: string
  /** 是否使用 NumberRoller 动效 */
  animated?: boolean
  /** 额外的 className */
  className?: string
}

/**
 * 涨跌变化指示器
 * 统一展示涨跌颜色、趋势图标和数值
 */
export function ChangeIndicator({
  value,
  decimals = 2,
  prefix,
  suffix = '%',
  showIcon = true,
  iconSize = 'size-3',
  animated = true,
  className,
}: ChangeIndicatorProps) {
  // 处理无效值
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return <span className="text-muted-foreground text-xs">--</span>
  }

  const isUp = value >= 0
  const autoPrefix = isUp ? '+' : ''

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-sm',
        isUp ? 'text-up' : 'text-down',
        className
      )}
    >
      {showIcon &&
        (isUp ? <TrendingUp className={iconSize} /> : <TrendingDown className={iconSize} />)}
      {animated ? (
        <NumberRoller
          value={value}
          decimals={decimals}
          prefix={prefix ?? autoPrefix}
          suffix={suffix}
        />
      ) : (
        <span>
          {prefix ?? autoPrefix}
          {value.toFixed(decimals)}
          {suffix}
        </span>
      )}
    </span>
  )
}

/**
 * 获取涨跌色 className
 * 用于需要自定义样式的场景
 */
export function getChangeColor(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return 'text-muted-foreground'
  }
  return value >= 0 ? 'text-up' : 'text-down'
}

/**
 * 判断是否为正值
 */
export function isPositive(value: number | undefined | null): boolean {
  return (value ?? 0) >= 0
}
