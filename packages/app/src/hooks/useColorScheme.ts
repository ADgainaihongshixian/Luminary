import { usePersistedSetting } from './usePersistedSetting'

type ColorScheme = 'green-up' | 'red-up'

/**
 * 应用涨跌色方案到 DOM
 */
function applyColorScheme(scheme: ColorScheme) {
  const root = document.documentElement
  if (scheme === 'red-up') {
    root.style.setProperty('--color-up', '#EF4444') // 涨红
    root.style.setProperty('--color-down', '#22C55E') // 跌绿
  } else {
    root.style.setProperty('--color-up', '#22C55E') // 涨绿
    root.style.setProperty('--color-down', '#EF4444') // 跌红
  }
}

/**
 * 验证是否为有效的涨跌色方案
 */
function isValidColorScheme(value: string): value is ColorScheme {
  return ['green-up', 'red-up'].includes(value)
}

/**
 * 涨跌色偏好管理 hook
 * green-up: 涨绿跌红（A 股习惯）
 * red-up: 涨红跌绿（港美股习惯）
 */
export function useColorScheme() {
  const { value: colorScheme, setValue: setColorScheme } = usePersistedSetting<ColorScheme>({
    key: 'colorScheme',
    defaultValue: 'red-up',
    apply: applyColorScheme,
    validate: isValidColorScheme,
  })

  return { colorScheme, setColorScheme }
}
