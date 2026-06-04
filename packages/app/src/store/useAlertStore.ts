import { create } from 'zustand'
import type { PriceAlert, AlertAssetType, AlertStatus } from '@fund-monitor/shared'
import { db } from '@/db/db'

/**
 * 生成 UUID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

interface AlertStore {
  /** 预警规则列表 */
  alerts: PriceAlert[]
  /** 是否正在加载 */
  isLoading: boolean

  /** 从 IndexedDB 加载预警 */
  loadAlerts: () => Promise<void>
  /** 添加预警 */
  addAlert: (
    alert: Omit<PriceAlert, 'id' | 'status' | 'triggeredAt' | 'createdAt'>
  ) => Promise<void>
  /** 更新预警 */
  updateAlert: (id: string, updates: Partial<PriceAlert>) => Promise<void>
  /** 删除预警 */
  deleteAlert: (id: string) => Promise<void>
  /** 重置预警（重新激活） */
  resetAlert: (id: string) => Promise<void>
  /** 触发预警 */
  triggerAlert: (id: string) => Promise<void>
  /** 获取指定资产的活跃预警 */
  getActiveAlerts: (assetType: AlertAssetType, assetCode: string) => PriceAlert[]
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  isLoading: false,

  loadAlerts: async () => {
    set({ isLoading: true })
    try {
      const alerts = await db.price_alerts.orderBy('createdAt').toArray()
      set({ alerts, isLoading: false })
    } catch (error) {
      console.error('加载预警数据失败:', error)
      set({ isLoading: false })
    }
  },

  addAlert: async (alertData) => {
    const now = Date.now()
    const newAlert: PriceAlert = {
      ...alertData,
      id: generateId(),
      status: 'active',
      triggeredAt: null,
      createdAt: now,
    }

    try {
      await db.price_alerts.add(newAlert)
      set((state) => ({ alerts: [...state.alerts, newAlert] }))
    } catch (error) {
      console.error('添加预警失败:', error)
      throw error
    }
  },

  updateAlert: async (id, updates) => {
    try {
      await db.price_alerts.update(id, updates)
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }))
    } catch (error) {
      console.error('更新预警失败:', error)
      throw error
    }
  },

  deleteAlert: async (id) => {
    try {
      await db.price_alerts.delete(id)
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      }))
    } catch (error) {
      console.error('删除预警失败:', error)
      throw error
    }
  },

  resetAlert: async (id) => {
    const updates = { status: 'active' as AlertStatus, triggeredAt: null }
    try {
      await db.price_alerts.update(id, updates)
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }))
    } catch (error) {
      console.error('重置预警失败:', error)
      throw error
    }
  },

  triggerAlert: async (id) => {
    const updates = { status: 'triggered' as AlertStatus, triggeredAt: Date.now() }
    try {
      await db.price_alerts.update(id, updates)
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }))
    } catch (error) {
      console.error('触发预警失败:', error)
    }
  },

  getActiveAlerts: (assetType, assetCode) => {
    return get().alerts.filter(
      (a) => a.assetType === assetType && a.assetCode === assetCode && a.status === 'active'
    )
  },
}))
