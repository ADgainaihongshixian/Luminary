import { create } from 'zustand'
import type { MetalSymbol, MetalPrice, ExchangeRate } from '@fund-monitor/shared'

interface MetalStore {
  /** 贵金属实时价格 */
  prices: Partial<Record<MetalSymbol, MetalPrice>>
  /** 当前汇率 */
  exchangeRate: ExchangeRate | null

  /** 更新价格数据 */
  setPrices: (prices: MetalPrice[]) => void
  /** 更新汇率 */
  setExchangeRate: (rate: ExchangeRate | null) => void
}

export const useMetalStore = create<MetalStore>((set) => ({
  prices: {},
  exchangeRate: null,

  setPrices: (prices) => {
    const priceMap: Partial<Record<MetalSymbol, MetalPrice>> = {}
    for (const p of prices) {
      priceMap[p.symbol] = p
    }
    set({ prices: priceMap })
  },

  setExchangeRate: (rate) => set({ exchangeRate: rate }),
}))
