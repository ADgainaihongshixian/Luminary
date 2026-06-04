import { create } from 'zustand'
import { db } from '@/db/db'
import { setTwelveDataKey as syncToDataService } from '@fund-monitor/data-service'

interface ApiConfigState {
  twelveDataKey: string
  /** 从 IndexedDB 加载配置 */
  loadFromDb: () => Promise<void>
  /** 保存 Twelve Data API Key */
  setTwelveDataKey: (key: string) => Promise<void>
}

export const useApiConfigStore = create<ApiConfigState>((set) => ({
  twelveDataKey: '',

  loadFromDb: async () => {
    try {
      const setting = await db.user_settings.where('key').equals('twelveDataKey').first()
      if (setting?.value) {
        const key = setting.value as string
        set({ twelveDataKey: key })
        syncToDataService(key)
      }
    } catch {
      // 忽略
    }
  },

  setTwelveDataKey: async (key: string) => {
    set({ twelveDataKey: key })
    syncToDataService(key)
    try {
      await db.user_settings.put({ key: 'twelveDataKey', value: key })
    } catch (error) {
      console.error('保存 API Key 失败:', error)
    }
  },
}))
