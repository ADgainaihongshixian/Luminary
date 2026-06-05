import { create } from 'zustand'
import type { PortfolioFund } from '@fund-monitor/shared'
import { db } from '@/db/db'
import { generateId } from '@/lib/id'

interface FundStore {
  /** 持仓基金列表 */
  funds: PortfolioFund[]
  /** 是否正在加载 */
  isLoading: boolean

  /** 从 IndexedDB 加载数据 */
  loadFunds: () => Promise<void>
  /** 添加基金 */
  addFund: (
    fund: Omit<PortfolioFund, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>
  /** 更新基金 */
  updateFund: (id: string, updates: Partial<PortfolioFund>) => Promise<void>
  /** 删除基金 */
  deleteFund: (id: string) => Promise<void>
}

export const useFundStore = create<FundStore>((set, get) => ({
  funds: [],
  isLoading: false,

  loadFunds: async () => {
    set({ isLoading: true })
    try {
      const funds = await db.portfolio_funds.orderBy('sortOrder').toArray()
      set({ funds, isLoading: false })
    } catch (error) {
      console.error('加载基金数据失败:', error)
      set({ isLoading: false })
    }
  },

  addFund: async (fundData) => {
    const now = Date.now()
    const newFund: PortfolioFund = {
      ...fundData,
      id: generateId(),
      sortOrder: get().funds.length,
      createdAt: now,
      updatedAt: now,
    }

    try {
      await db.portfolio_funds.add(newFund)
      set((state) => ({ funds: [...state.funds, newFund] }))
    } catch (error) {
      console.error('添加基金失败:', error)
      throw error
    }
  },

  updateFund: async (id, updates) => {
    const now = Date.now()
    const updatedData = { ...updates, updatedAt: now }

    try {
      await db.portfolio_funds.update(id, updatedData)
      set((state) => ({
        funds: state.funds.map((f) => (f.id === id ? { ...f, ...updatedData } : f)),
      }))
    } catch (error) {
      console.error('更新基金失败:', error)
      throw error
    }
  },

  deleteFund: async (id) => {
    try {
      await db.portfolio_funds.delete(id)
      set((state) => ({
        funds: state.funds.filter((f) => f.id !== id),
      }))
    } catch (error) {
      console.error('删除基金失败:', error)
      throw error
    }
  },
}))
