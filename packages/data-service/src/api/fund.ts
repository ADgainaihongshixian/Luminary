import type { FundEstimate, FundSearchItem, FundNavHistory } from '@fund-monitor/shared'
import { bffFetch } from './bffFetch'

/**
 * 搜索基金
 * @param keyword 关键词（基金名称或代码）
 */
export async function searchFunds(keyword: string): Promise<FundSearchItem[]> {
  if (!keyword || keyword.length < 2) return []

  return bffFetch<FundSearchItem[]>(
    '/funds/search',
    { keyword },
    {
      fallback: [],
      errorPrefix: '搜索基金',
    }
  )
}

/**
 * 获取基金实时估值
 * @param fundCode 基金代码
 */
export async function getFundEstimate(fundCode: string): Promise<FundEstimate | null> {
  return bffFetch<FundEstimate | null>(
    '/funds/estimate',
    { code: fundCode },
    {
      fallback: null,
      errorPrefix: '获取基金估值',
    }
  )
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
  return bffFetch<FundNavHistory[]>(
    '/funds/nav',
    { code: fundCode, page: String(page), size: String(pageSize) },
    {
      fallback: [],
      errorPrefix: '获取基金净值',
    }
  )
}
