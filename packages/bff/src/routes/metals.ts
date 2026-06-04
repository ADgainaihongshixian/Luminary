import { Hono } from 'hono'
import { getMetalPrices, getMetalHistory } from '../services/metals-api'
import { cachedFetch } from '../cache'

export const metalsRoutes = new Hono()

/**
 * GET /api/metals/price?symbols=XAU,XAG,XPT
 * 获取贵金属实时价格（免费 API，无需 Key）
 */
metalsRoutes.get('/price', async (c) => {
  const symbolsParam = c.req.query('symbols') ?? 'XAU,XAG,XPT'
  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase())

  try {
    const prices = await cachedFetch(
      `metals:price:${symbols.join(',')}`,
      () => getMetalPrices(symbols),
      { ttl: 30 } // 缓存 30 秒
    )

    return c.json({ success: true, data: prices })
  } catch (error) {
    console.error('Metals price error:', error)
    return c.json({ error: 'Failed to fetch metal prices' }, 500)
  }
})

/**
 * GET /api/metals/history?symbol=XAU&range=1M
 * 获取贵金属历史价格
 */
metalsRoutes.get('/history', async (c) => {
  const symbol = (c.req.query('symbol') ?? 'XAU').toUpperCase()
  const range = c.req.query('range') ?? '1M'
  const apiKey = c.req.header('X-TwelveData-Key') ?? ''

  try {
    const history = await cachedFetch(
      `metals:history:${symbol}:${range}:${apiKey.slice(-4)}`,
      () => getMetalHistory(symbol, range, apiKey),
      { ttl: 300 } // 缓存 5 分钟
    )

    return c.json({ success: true, data: history })
  } catch (error) {
    console.error('Metals history error:', error)
    return c.json({ error: 'Failed to fetch metal history' }, 500)
  }
})
