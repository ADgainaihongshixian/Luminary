import type { ExchangeRate } from '@fund-monitor/shared'
import { bffFetch } from './bffFetch'

/**
 * 获取实时汇率
 * @param from 源货币代码（如 'USD'）
 * @param to 目标货币代码（如 'CNY'）
 */
export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate | null> {
  return bffFetch<ExchangeRate | null>(
    '/exchange-rate',
    { from, to },
    {
      fallback: null,
      errorPrefix: '获取汇率',
    }
  )
}
