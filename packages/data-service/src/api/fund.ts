import type { FundEstimate, FundSearchItem, FundNavHistory } from '@fund-monitor/shared'

// BFF 基础地址（开发环境通过 Vite 代理，生产环境直接访问）
const BFF_BASE = '/api'

/**
 * 搜索基金
 * @param keyword 关键词（基金名称或代码）
 */
export async function searchFunds(keyword: string): Promise<FundSearchItem[]> {
  if (!keyword || keyword.length < 2) return []

  try {
    const response = await fetch(`${BFF_BASE}/funds/search?keyword=${encodeURIComponent(keyword)}`)
    if (!response.ok) return []

    const data = await response.json()
    return data.data ?? []
  } catch (error) {
    console.error('搜索基金失败:', error)
    return []
  }
}

/**
 * 获取基金实时估值
 * @param fundCode 基金代码
 */
export async function getFundEstimate(fundCode: string): Promise<FundEstimate | null> {
  try {
    const response = await fetch(`${BFF_BASE}/funds/estimate?code=${fundCode}`)
    if (!response.ok) return null

    const data = await response.json()
    return data.data ?? null
  } catch (error) {
    console.error('获取基金估值失败:', error)
    return null
  }
}

/**
 * 获取基金历史净值
 * @param fundCode 基金代码
 * @param page 页码
 * @param pageSize 每页条数
 */
export async function getFundNavHistory(
  fundCode: string,
  page = 1,
  pageSize = 20
): Promise<FundNavHistory[]> {
  try {
    const response = await fetch(
      `${BFF_BASE}/funds/nav?code=${fundCode}&page=${page}&size=${pageSize}`
    )
    if (!response.ok) return []

    const data = await response.json()
    return data.data ?? []
  } catch (error) {
    console.error('获取基金净值失败:', error)
    return []
  }
}
