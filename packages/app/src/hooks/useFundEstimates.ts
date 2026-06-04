import { useQueries, useQueryClient } from '@tanstack/react-query'
import { getFundEstimate } from '@fund-monitor/data-service'
import type { PortfolioFund } from '@fund-monitor/shared'
import { useCallback } from 'react'

/**
 * 批量获取基金估值 hook
 * 为每只基金创建独立的查询，支持 15 分钟轮询
 */
export function useFundEstimates(funds: PortfolioFund[]) {
  const queryClient = useQueryClient()

  const queries = useQueries({
    queries: funds.map((fund) => ({
      queryKey: ['fundEstimate', fund.fundCode],
      queryFn: () => getFundEstimate(fund.fundCode),
      refetchInterval: 1000 * 60 * 15,
      staleTime: 1000 * 60 * 10,
      enabled: !!fund.fundCode,
    })),
  })

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['fundEstimate'] })
  }, [queryClient])

  const isAnyLoading = queries.some((q) => q.isLoading)

  return {
    data: funds.map((fund, i) => ({
      fund,
      estimate: queries[i].data ?? null,
      isLoading: queries[i].isLoading,
    })),
    refreshAll,
    isLoading: isAnyLoading,
  }
}
