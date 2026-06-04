import type { MetalSymbol, MetalPrice, MetalOHLC } from '@fund-monitor/shared'

const BFF_BASE = '/api'

/** 全局 API Key，由前端启动时注入 */
let twelveDataKey = ''

/** 设置 Twelve Data API Key（由前端调用） */
export function setTwelveDataKey(key: string) {
  twelveDataKey = key
}

/** 安全数值转换，防止 NaN */
function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

interface BffMetalPrice {
  symbol: string
  price: number
  cnyPricePerGram: number
  prevClose?: number
  change?: number
  changePercent?: number
  updatedAt: string
}

/**
 * 获取贵金属实时价格
 * BFF 返回含涨跌数据的完整价格信息
 */
export async function getMetalPrices(symbols: MetalSymbol[]): Promise<MetalPrice[]> {
  try {
    const symbolsParam = symbols.join(',')
    const response = await fetch(`${BFF_BASE}/metals/price?symbols=${symbolsParam}`)
    if (!response.ok) return []

    const data = await response.json()
    const prices: BffMetalPrice[] = data.data ?? []

    return prices.map((p) => {
      const price = safeNumber(p.price)
      const prevClose = safeNumber(p.prevClose, price)
      const change = safeNumber(p.change)
      const changePercent = safeNumber(p.changePercent)

      return {
        symbol: p.symbol as MetalSymbol,
        price,
        cnyPricePerGram: safeNumber(p.cnyPricePerGram),
        open: price,
        high: price,
        low: price,
        prevClose,
        change,
        changePercent,
        dayChange: change,
        dayChangePercent: changePercent,
        updatedAt: safeNumber(new Date(p.updatedAt).getTime(), Date.now()),
      }
    })
  } catch (error) {
    console.error('获取贵金属价格失败:', error)
    return []
  }
}

/**
 * 获取贵金属历史 OHLC 数据
 */
export async function getMetalHistory(symbol: MetalSymbol, range: string): Promise<MetalOHLC[]> {
  try {
    const headers: Record<string, string> = {}
    if (twelveDataKey) {
      headers['X-TwelveData-Key'] = twelveDataKey
    }

    const response = await fetch(`${BFF_BASE}/metals/history?symbol=${symbol}&range=${range}`, {
      headers,
    })
    if (!response.ok) return []

    const data = await response.json()
    return data.data ?? []
  } catch (error) {
    console.error('获取贵金属历史数据失败:', error)
    return []
  }
}
