import { useState, useEffect, useCallback } from 'react'
import { db } from '@/db/db'

type Theme = 'dark' | 'light' | 'system'

/**
 * 主题管理 hook
 * 支持 dark / light / system 三种模式
 * 持久化到 IndexedDB user_settings
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark')

  // 初始化：从 IndexedDB 读取，或检测系统偏好
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const setting = await db.user_settings.get('theme')
        if (setting?.value) {
          setThemeState(setting.value as Theme)
          applyTheme(setting.value as Theme)
        } else {
          // 默认暗色
          applyTheme('dark')
        }
      } catch {
        applyTheme('dark')
      }
    }
    loadTheme()
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    try {
      await db.user_settings.put({ key: 'theme', value: newTheme })
    } catch (error) {
      console.error('保存主题设置失败:', error)
    }
  }, [])

  return { theme, setTheme }
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}
