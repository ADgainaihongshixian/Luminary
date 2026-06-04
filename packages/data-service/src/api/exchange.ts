import type { ExchangeRate } from '@fund-monitor/shared'

const BFF_BASE = '/api'

/**
 * 获取实时汇率
 * @param from 源货币代码（如 'USD'）
 * @param to 目标货币代码（如 'CNY'）
 */
export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate | null> {
  try {
    const response = await fetch(`${BFF_BASE}/exchange-rate?from=${from}&to=${to}`)
    if (!response.ok) return null

    const data = await response.json()
    return data.data ?? null
  } catch (error) {
    console.error('获取汇率失败:', error)
    return null
  }
}
