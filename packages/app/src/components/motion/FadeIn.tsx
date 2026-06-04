import { motion, type HTMLMotionProps } from 'framer-motion'

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number
  duration?: number
}

/**
 * 淡入动效容器
 * 用于卡片列表的 staggered 进入动画
 */
export function FadeIn({ delay = 0, duration = 0.4, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

/**
 * 交错动画容器
 * 子元素依次进入
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.06,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画子元素
 */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  )
}
