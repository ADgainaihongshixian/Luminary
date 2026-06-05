/**
 * 贵金属 API 适配器 — 国内优先策略
 *
 * 数据源：
 * - 【实时价格-金银】新浪财经 hq.sinajs.cn（国内直连 ~350ms，免费，无需 Key）
 * - 【实时价格-铂金/钯金】api.gold-api.com（海外 ~1.5s，免费，无需 Key）
 * - 【历史数据-金银】新浪期货 API（国内直连，免费，全量数据）
 * - 【历史数据-铂金/钯金】Twelve Data（海外，需 API Key）
 * - 【汇率】open.er-api.com（海外 ~1s，免费，无需 Key）
 */

import { getSinaRealtimePrices } from './sina-finance'

const TROY_OZ_TO_GRAM = 31.1035

/** 新浪支持的品种（金银） */
const SINA_SUPPORTED = new Set(['XAU', 'XAG'])

interface GoldApiResponse {
  currency: string
  currencySymbol: string
  exchangeRate: number
  name: string
  price: number
  symbol: string
  updatedAt: string
}

interface ExchangeRateApiResponse {
  result: string
  base_code: string
  rates: Record<string, number>
  time_last_update_utc: string
}

export interface MetalPriceData {
  symbol: string
  price: number // USD/oz
  cnyPricePerGram: number // CNY/g
  open: number // 今日开盘
  high: number // 今日最高
  low: number // 今日最低
  prevClose: number
  change: number
  changePercent: number
  updatedAt: string
}

export interface MetalHistoryEntry {
  date: string
  open: number
  high: number
  low: number
  close: number
}

// 缓存上次价格，用于计算涨跌
const priceCache = new Map<string, { price: number; timestamp: number }>()

/** 获取汇率 */
export async function fetchExchangeRate(from: string, to: string): Promise<number> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
    headers: { 'User-Agent': 'fund-monitor/1.0' },
  })

  if (!response.ok) {
    throw new Error(`ExchangeRate API error: ${response.status}`)
  }

  const data: ExchangeRateApiResponse = await response.json()

  if (data.result !== 'success' || !data.rates[to]) {
    throw new Error(`Exchange rate not found: ${from} -> ${to}`)
  }

  return data.rates[to]
}

/** 获取汇率（完整信息） */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<{ from: string; to: string; rate: number; updatedAt: string } | null> {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
      headers: { 'User-Agent': 'fund-monitor/1.0' },
    })

    if (!response.ok) return null

    const data: ExchangeRateApiResponse = await response.json()
    if (data.result !== 'success' || !data.rates[to]) return null

    return {
      from,
      to,
      rate: +data.rates[to].toFixed(4),
      updatedAt: data.time_last_update_utc,
    }
  } catch {
    return null
  }
}

/**
 * 通过 gold-api.com 获取实时价格（铂金/钯金兜底）
 */
async function fetchGoldApiPrice(symbol: string): Promise<MetalPriceData | null> {
  try {
    const response = await fetch(`https://api.gold-api.com/price/${symbol}`, {
      headers: { 'User-Agent': 'fund-monitor/1.0' },
    })

    if (!response.ok) return null

    const data: GoldApiResponse = await response.json()
    const rate = await fetchExchangeRate('USD', 'CNY')

    const cached = priceCache.get(symbol)
    const prevClose = Number.isFinite(cached?.price) ? cached!.price : data.price
    const rawChange =
      Number.isFinite(data.price) && Number.isFinite(prevClose) ? data.price - prevClose : 0
    const change = +rawChange.toFixed(2)
    const changePercent = prevClose > 0 ? +((rawChange / prevClose) * 100).toFixed(2) : 0

    priceCache.set(symbol, { price: data.price, timestamp: Date.now() })

    return {
      symbol,
      price: data.price,
      cnyPricePerGram:
        Number.isFinite(data.price) && Number.isFinite(rate)
          ? +((data.price / TROY_OZ_TO_GRAM) * rate).toFixed(2)
          : 0,
      open: data.price, // gold-api 不提供 OHLC，用当前价兜底
      high: data.price,
      low: data.price,
      prevClose,
      change,
      changePercent,
      updatedAt: data.updatedAt,
    }
  } catch (error) {
    console.error(`Gold-API ${symbol} 获取失败:`, error)
    return null
  }
}

/**
 * 批量获取贵金属实时价格
 * 金银走新浪（快），铂金/钯金走 gold-api.com（兜底）
 */
export async function getMetalPrices(symbols: string[]): Promise<MetalPriceData[]> {
  const rate = await fetchExchangeRate('USD', 'CNY')
  const results: MetalPriceData[] = []

  // 1. 新浪批量获取金银
  const sinaSymbols = symbols.filter((s) => SINA_SUPPORTED.has(s))
  const sinaPrices = await getSinaRealtimePrices(sinaSymbols)

  for (const sp of sinaPrices) {
    const cached = priceCache.get(sp.symbol)
    const prevClose = sp.prevClose > 0 ? sp.prevClose : (cached?.price ?? sp.price)
    const change = +(sp.price - prevClose).toFixed(2)
    const changePercent = prevClose > 0 ? +((change / prevClose) * 100).toFixed(2) : 0

    priceCache.set(sp.symbol, { price: sp.price, timestamp: Date.now() })

    results.push({
      symbol: sp.symbol,
      price: sp.price,
      cnyPricePerGram: Number.isFinite(rate)
        ? +((sp.price / TROY_OZ_TO_GRAM) * rate).toFixed(2)
        : 0,
      open: sp.open,
      high: sp.high,
      low: sp.low,
      prevClose,
      change,
      changePercent,
      updatedAt: sp.updatedAt || new Date().toISOString(),
    })
  }

  // 2. 铂金/钯金走 gold-api.com
  const fallbackSymbols = symbols.filter((s) => !SINA_SUPPORTED.has(s))
  const fallbackResults = await Promise.allSettled(fallbackSymbols.map((s) => fetchGoldApiPrice(s)))

  for (const r of fallbackResults) {
    if (r.status === 'fulfilled' && r.value) {
      results.push(r.value)
    }
  }

  return results
}

/**
 * 获取历史 K 线数据
 * 全部走 Twelve Data（国际现货价格，USD/oz），确保与实时数据一致
 * @param apiKey - 前端传入的 API Key（优先），兜底使用环境变量
 */
export async function getMetalHistory(
  symbol: string,
  range: string,
  apiKey?: string
): Promise<MetalHistoryEntry[]> {
  return fetchTwelveDataHistory(symbol, range, apiKey)
}

// --- Twelve Data 兜底 ---

// @ts-expect-error Cloudflare Workers 全局变量
const TWELVEDATA_API_KEY: string =
  typeof globalThis.TWELVEDATA_API_KEY !== 'undefined' ? globalThis.TWELVEDATA_API_KEY : ''

const TWELVEDATA_SYMBOLS: Record<string, string> = {
  XAU: 'XAU/USD',
  XAG: 'XAG/USD',
  XPT: 'XPT/USD',
  XPD: 'XPD/USD',
}

const RANGE_OUTPUTSIZE: Record<string, number> = {
  '1D': 5,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 250,
}

async function fetchTwelveDataHistory(
  symbol: string,
  range: string,
  apiKey?: string
): Promise<MetalHistoryEntry[]> {
  const key = apiKey || TWELVEDATA_API_KEY
  if (!key) return []

  const tdSymbol = TWELVEDATA_SYMBOLS[symbol]
  if (!tdSymbol) return []

  const size = RANGE_OUTPUTSIZE[range] ?? 30
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSymbol)}&interval=1day&outputsize=${size}&apikey=${key}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Twelve Data error: ${response.status}`)

    const json = (await response.json()) as { status?: string; values?: unknown[] }
    if (json.status === 'error') return []

    const values = json.values as
      | { datetime: string; open: string; high: string; low: string; close: string }[]
      | undefined
    if (!Array.isArray(values) || values.length === 0) return []

    return values
      .reverse()
      .map((v) => ({
        date: v.datetime,
        open: +Number(v.open).toFixed(2),
        high: +Number(v.high).toFixed(2),
        low: +Number(v.low).toFixed(2),
        close: +Number(v.close).toFixed(2),
      }))
      .filter((e) => Number.isFinite(e.open) && Number.isFinite(e.close))
  } catch (error) {
    console.error(`Twelve Data ${symbol} 历史数据获取失败:`, error)
    return []
  }
}
