import { create } from 'zustand'
import type { FundGroup } from '@fund-monitor/shared'
import { db } from '@/db/db'
import { generateId } from '@/lib/id'

interface GroupStore {
  groups: FundGroup[]
  isLoading: boolean

  loadGroups: () => Promise<void>
  addGroup: (name: string) => Promise<void>
  updateGroup: (id: string, name: string) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  isLoading: false,

  loadGroups: async () => {
    set({ isLoading: true })
    try {
      const groups = await db.fund_groups.orderBy('sortOrder').toArray()
      set({ groups, isLoading: false })
    } catch (error) {
      console.error('加载分组失败:', error)
      set({ isLoading: false })
    }
  },

  addGroup: async (name) => {
    const now = Date.now()
    const newGroup: FundGroup = {
      id: generateId(),
      name,
      sortOrder: get().groups.length,
      createdAt: now,
    }

    try {
      await db.fund_groups.add(newGroup)
      set((state) => ({ groups: [...state.groups, newGroup] }))
    } catch (error) {
      console.error('添加分组失败:', error)
      throw error
    }
  },

  updateGroup: async (id, name) => {
    try {
      await db.fund_groups.update(id, { name })
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? { ...g, name } : g)),
      }))
    } catch (error) {
      console.error('更新分组失败:', error)
      throw error
    }
  },

  deleteGroup: async (id) => {
    try {
      // 将该分组下的基金的 groupId 设为 null
      const fundsInGroup = await db.portfolio_funds.where('groupId').equals(id).toArray()
      for (const fund of fundsInGroup) {
        await db.portfolio_funds.update(fund.id, { groupId: null })
      }
      await db.fund_groups.delete(id)
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }))
    } catch (error) {
      console.error('删除分组失败:', error)
      throw error
    }
  },
}))
