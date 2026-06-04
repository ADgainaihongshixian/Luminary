import { useQuery } from '@tanstack/react-query'
import { getExchangeRate } from '@fund-monitor/data-service'
import { useEffect } from 'react'
import { useMetalStore } from '@/store/useMetalStore'

/**
 * 实时汇率 hook (USD/CNY)
 * 每 5 分钟刷新
 */
export function useExchangeRate() {
  const setExchangeRate = useMetalStore((s) => s.setExchangeRate)

  const query = useQuery({
    queryKey: ['exchangeRate', 'USD', 'CNY'],
    queryFn: () => getExchangeRate('USD', 'CNY'),
    refetchInterval: 1000 * 60 * 5, // 5 分钟轮询
    staleTime: 1000 * 60 * 4,
  })

  // 同步到 Zustand store
  useEffect(() => {
    if (query.data) {
      setExchangeRate(query.data)
    }
  }, [query.data, setExchangeRate])

  return {
    rate: query.data,
    isLoading: query.isLoading,
  }
}
