import { useEffect } from 'react'
import { usePersistedSetting } from './usePersistedSetting'

type Theme = 'dark' | 'light' | 'system'

/**
 * 验证是否为有效的主题
 */
function isValidTheme(value: string): value is Theme {
  return ['dark', 'light', 'system'].includes(value)
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

/**
 * 主题管理 hook
 * 支持 dark / light / system 三种模式
 * 持久化到 IndexedDB user_settings
 */
export function useTheme() {
  const { value: theme, setValue: setTheme } = usePersistedSetting<Theme>({
    key: 'theme',
    defaultValue: 'dark',
    apply: applyTheme,
    validate: isValidTheme,
  })

  // 监听系统主题变化（仅 system 模式下生效）
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return { theme, setTheme }
}
