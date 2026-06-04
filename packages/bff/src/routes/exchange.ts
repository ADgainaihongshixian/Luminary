import { Hono } from 'hono'
import { getExchangeRate } from '../services/metals-api'
import { cachedFetch } from '../cache'

export const exchangeRoutes = new Hono()

/**
 * GET /api/exchange-rate?from=USD&to=CNY
 * 获取实时汇率（免费 API，无需 Key）
 */
exchangeRoutes.get('/exchange-rate', async (c) => {
  const from = c.req.query('from') ?? 'USD'
  const to = c.req.query('to') ?? 'CNY'

  try {
    const rate = await cachedFetch(
      `exchange:${from}:${to}`,
      () => getExchangeRate(from, to),
      { ttl: 300 } // 缓存 5 分钟
    )

    if (!rate) {
      return c.json({ error: 'Exchange rate not found' }, 404)
    }

    return c.json({ success: true, data: rate })
  } catch (error) {
    console.error('Exchange rate error:', error)
    return c.json({ error: 'Failed to fetch exchange rate' }, 500)
  }
})
