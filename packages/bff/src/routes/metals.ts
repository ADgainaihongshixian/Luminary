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
 * API Key 优先使用服务端环境变量，其次使用客户端 header 传入的 key
 */
metalsRoutes.get('/history', async (c) => {
  const symbol = (c.req.query('symbol') ?? 'XAU').toUpperCase()
  const range = c.req.query('range') ?? '1M'
  // 优先使用服务端环境变量（通过 `wrangler secret put TWELVEDATA_API_KEY` 配置）
  const serverKey = (c.env as Record<string, string>)?.TWELVEDATA_API_KEY || ''
  const clientKey = c.req.header('X-TwelveData-Key') ?? ''
  const apiKey = serverKey || clientKey

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
