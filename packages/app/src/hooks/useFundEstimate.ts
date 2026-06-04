import { useQuery } from '@tanstack/react-query'
import { getFundEstimate } from '@fund-monitor/data-service'

/**
 * 基金实时估值 hook
 * 交易时段每 15 分钟自动刷新
 */
export function useFundEstimate(fundCode: string | undefined) {
  return useQuery({
    queryKey: ['fundEstimate', fundCode],
    queryFn: () => getFundEstimate(fundCode!),
    enabled: !!fundCode,
    refetchInterval: 1000 * 60 * 15, // 15 分钟轮询
    staleTime: 1000 * 60 * 10,
  })
}
