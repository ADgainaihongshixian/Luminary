import { useState, useEffect, useCallback } from 'react'
import { db } from '@/db/db'

type ColorScheme = 'green-up' | 'red-up'

/**
 * 涨跌色偏好管理 hook
 * green-up: 涨绿跌红（A 股习惯）
 * red-up: 涨红跌绿（港美股习惯，默认）
 */
export function useColorScheme() {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('red-up')

  useEffect(() => {
    const load = async () => {
      try {
        const setting = await db.user_settings.get('colorScheme')
        if (setting?.value) {
          setColorSchemeState(setting.value as ColorScheme)
          applyColorScheme(setting.value as ColorScheme)
        } else {
          // 无历史设置，应用默认：涨红跌绿
          applyColorScheme('red-up')
        }
      } catch {
        applyColorScheme('red-up')
      }
    }
    load()
  }, [])

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    setColorSchemeState(scheme)
    applyColorScheme(scheme)

    try {
      await db.user_settings.put({ key: 'colorScheme', value: scheme })
    } catch (error) {
      console.error('保存涨跌色偏好失败:', error)
    }
  }, [])

  return { colorScheme, setColorScheme }
}

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
