import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface PriceFlashProps {
  value: number
  children: React.ReactNode
  className?: string
}

/**
 * 涨跌闪烁效果
 * 价格更新时短暂闪烁 0.5s 渐隐
 */
export function PriceFlash({ value, children, className }: PriceFlashProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(value > prevRef.current ? 'up' : 'down')
      prevRef.current = value

      const timer = setTimeout(() => setFlash(null), 500)
      return () => clearTimeout(timer)
    }
  }, [value])

  const bgColor =
    flash === 'up'
      ? 'rgba(34, 197, 94, 0.15)'
      : flash === 'down'
        ? 'rgba(239, 68, 68, 0.15)'
        : 'transparent'

  return (
    <motion.span
      className={className}
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  )
}
