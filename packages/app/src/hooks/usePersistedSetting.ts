import { useState, useEffect, useCallback } from 'react'
import { db } from '@/db/db'

interface UsePersistedSettingConfig<T extends string> {
  /** IndexedDB 中的 key */
  key: string
  /** 默认值 */
  defaultValue: T
  /** 应用设置到 DOM 的函数 */
  apply: (value: T) => void
  /** 验证函数，用于检查加载的值是否有效 */
  validate?: (value: string) => value is T
}

/**
 * 通用持久化设置 hook
 * 从 IndexedDB 加载设置，应用到 DOM，并提供更新函数
 *
 * @example
 * const { value: theme, setValue: setTheme } = usePersistedSetting({
 *   key: 'theme',
 *   defaultValue: 'dark',
 *   apply: applyTheme,
 *   validate: (v): v is Theme => ['dark', 'light', 'system'].includes(v),
 * })
 */
export function usePersistedSetting<T extends string>(config: UsePersistedSettingConfig<T>) {
  const { key, defaultValue, apply, validate } = config
  const [value, setValueState] = useState<T>(defaultValue)

  // 初始化：从 IndexedDB 加载
  useEffect(() => {
    const load = async () => {
      try {
        const setting = await db.user_settings.get(key)
        if (setting?.value) {
          const loadedValue = setting.value as string
          if (!validate || validate(loadedValue)) {
            setValueState(loadedValue as T)
            apply(loadedValue as T)
            return
          }
        }
        // 无有效值时应用默认值
        apply(defaultValue)
      } catch {
        apply(defaultValue)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 更新设置
  const setValue = useCallback(
    async (newValue: T) => {
      setValueState(newValue)
      apply(newValue)

      try {
        await db.user_settings.put({ key, value: newValue })
      } catch (error) {
        console.error(`保存设置失败 (${key}):`, error)
      }
    },
    [key, apply]
  )

  return { value, setValue }
}
