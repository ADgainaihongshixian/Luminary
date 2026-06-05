import type { MetalSymbol, MetalPrice, MetalOHLC } from '@fund-monitor/shared'
import { bffFetch, safeNumber } from './bffFetch'

/** 全局 API Key，由前端启动时注入 */
let twelveDataKey = ''

/** 设置 Twelve Data API Key（由前端调用） */
export function setTwelveDataKey(key: string) {
  twelveDataKey = key
}

interface BffMetalPrice {
  symbol: string
  price: number
  cnyPricePerGram: number
  open?: number
  high?: number
  low?: number
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
  const prices = await bffFetch<BffMetalPrice[]>(
    '/metals/price',
    { symbols: symbols.join(',') },
    {
      fallback: [],
      errorPrefix: '获取贵金属价格',
    }
  )

  if (!Array.isArray(prices)) return []

  return prices.map((p) => {
    const price = safeNumber(p.price)
    const prevClose = safeNumber(p.prevClose, price)
    const change = safeNumber(p.change)
    const changePercent = safeNumber(p.changePercent)

    return {
      symbol: p.symbol as MetalSymbol,
      price,
      cnyPricePerGram: safeNumber(p.cnyPricePerGram),
      open: safeNumber(p.open, price),
      high: safeNumber(p.high, price),
      low: safeNumber(p.low, price),
      prevClose,
      change,
      changePercent,
      dayChange: change,
      dayChangePercent: changePercent,
      updatedAt: safeNumber(new Date(p.updatedAt).getTime(), Date.now()),
    }
  })
}

/**
 * 获取贵金属历史 OHLC 数据
 */
export async function getMetalHistory(symbol: MetalSymbol, range: string): Promise<MetalOHLC[]> {
  const headers: Record<string, string> = {}
  if (twelveDataKey) {
    headers['X-TwelveData-Key'] = twelveDataKey
  }

  return bffFetch<MetalOHLC[]>(
    '/metals/history',
    { symbol, range },
    {
      headers,
      fallback: [],
      errorPrefix: '获取贵金属历史数据',
    }
  )
}
