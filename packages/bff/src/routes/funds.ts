import { Hono } from 'hono'
import { searchFunds, getFundEstimate, getFundNavHistory } from '../services/fund-api'
import { cachedFetch } from '../cache'

export const fundsRoutes = new Hono()

/**
 * GET /api/funds/search?keyword=xxx
 * 搜索基金
 */
fundsRoutes.get('/search', async (c) => {
  const keyword = c.req.query('keyword') ?? ''

  if (keyword.length < 2) {
    return c.json({ success: true, data: [] })
  }

  try {
    const results = await cachedFetch(
      `funds:search:${keyword}`,
      () => searchFunds(keyword),
      { ttl: 300 } // 缓存 5 分钟
    )

    return c.json({ success: true, data: results })
  } catch (error) {
    console.error('Fund search error:', error)
    return c.json({ error: 'Failed to search funds' }, 500)
  }
})

/**
 * GET /api/funds/estimate?code=xxx
 * 获取基金实时估值
 */
fundsRoutes.get('/estimate', async (c) => {
  const code = c.req.query('code') ?? ''

  if (!code) {
    return c.json({ error: 'fund code is required' }, 400)
  }

  try {
    const estimate = await cachedFetch(
      `funds:estimate:${code}`,
      () => getFundEstimate(code),
      { ttl: 60 } // 缓存 1 分钟
    )

    return c.json({ success: true, data: estimate })
  } catch (error) {
    console.error('Fund estimate error:', error)
    return c.json({ error: 'Failed to fetch fund estimate' }, 500)
  }
})

/**
 * GET /api/funds/nav?code=xxx&page=1&size=20
 * 获取基金历史净值
 */
fundsRoutes.get('/nav', async (c) => {
  const code = c.req.query('code') ?? ''
  const page = parseInt(c.req.query('page') ?? '1', 10)
  const size = parseInt(c.req.query('size') ?? '20', 10)

  if (!code) {
    return c.json({ error: 'fund code is required' }, 400)
  }

  try {
    const navHistory = await cachedFetch(
      `funds:nav:${code}:${page}:${size}`,
      () => getFundNavHistory(code, page, size),
      { ttl: 300 } // 缓存 5 分钟
    )

    return c.json({ success: true, data: navHistory })
  } catch (error) {
    console.error('Fund NAV error:', error)
    return c.json({ error: 'Failed to fetch fund NAV history' }, 500)
  }
})
