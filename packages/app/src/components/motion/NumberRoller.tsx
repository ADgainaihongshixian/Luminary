import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface NumberRollerProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * 数字滚动动效组件
 * 数字变化时使用 spring 动画平滑过渡
 */
export function NumberRoller({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  className,
}: NumberRollerProps) {
  const springValue = useSpring(value, { stiffness: 100, damping: 30 })
  const display = useTransform(springValue, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)
  const [displayValue, setDisplayValue] = useState(`${prefix}${value.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v))
    return unsubscribe
  }, [display])

  return <motion.span className={className}>{displayValue}</motion.span>
}
