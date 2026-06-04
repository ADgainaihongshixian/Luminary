import { useState, useEffect, useCallback } from 'react'
import { db } from '@/db/db'

export type ThemeColor = 'purple' | 'cyber' | 'aurora' | 'sunset' | 'sakura'

export const THEME_COLORS: {
  value: ThemeColor
  label: string
  color: string
  description: string
}[] = [
  { value: 'purple', label: '紫霓虹', color: '#7C3AED', description: '经典科技感' },
  { value: 'cyber', label: '赛博蓝', color: '#0EA5E9', description: '理性专业' },
  { value: 'aurora', label: '极光绿', color: '#10B981', description: '自然增长' },
  { value: 'sunset', label: '落日橙', color: '#F59E0B', description: '热情果断' },
  { value: 'sakura', label: '樱花粉', color: '#EC4899', description: '时尚个性' },
]

/**
 * 主题配色方案 hook
 * 管理 accent 颜色，持久化到 IndexedDB
 */
export function useThemeColor() {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('purple')

  useEffect(() => {
    const loadColor = async () => {
      try {
        const setting = await db.user_settings.where('key').equals('themeColor').first()
        if (setting?.value && isValidThemeColor(setting.value as string)) {
          setThemeColorState(setting.value as ThemeColor)
          applyThemeColor(setting.value as ThemeColor)
        }
      } catch {
        // 默认紫色
      }
    }
    loadColor()
  }, [])

  const setThemeColor = useCallback(async (color: ThemeColor) => {
    setThemeColorState(color)
    applyThemeColor(color)

    try {
      await db.user_settings.put({ key: 'themeColor', value: color })
    } catch (error) {
      console.error('保存配色方案失败:', error)
    }
  }, [])

  return { themeColor, setThemeColor }
}

function isValidThemeColor(value: string): value is ThemeColor {
  return ['purple', 'cyber', 'aurora', 'sunset', 'sakura'].includes(value)
}

/**
 * 应用配色方案到 DOM
 * 通过在 html 元素上添加/移除 .theme-{color} 类来切换配色
 */
function applyThemeColor(color: ThemeColor) {
  const root = document.documentElement
  const themeClasses = [
    'theme-purple',
    'theme-cyber',
    'theme-aurora',
    'theme-sunset',
    'theme-sakura',
  ]

  // 移除所有配色类
  root.classList.remove(...themeClasses)

  // 添加目标配色类（purple 是默认色，不需要额外类）
  if (color !== 'purple') {
    root.classList.add(`theme-${color}`)
  }
}
