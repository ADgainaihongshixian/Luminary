import { useQuery } from '@tanstack/react-query'
import { getMetalPrices } from '@fund-monitor/data-service'
import { DEFAULT_METAL_SYMBOLS } from '@fund-monitor/shared'
import { useEffect } from 'react'
import { useMetalStore } from '@/store/useMetalStore'

/**
 * 贵金属实时价格 hook
 * 每 30 秒自动刷新（全球金属市场交易时段）
 */
export function useMetalPrices() {
  const setPrices = useMetalStore((s) => s.setPrices)

  const query = useQuery({
    queryKey: ['metalPrices'],
    queryFn: () => getMetalPrices(DEFAULT_METAL_SYMBOLS),
    refetchInterval: 1000 * 30, // 30 秒轮询
    staleTime: 1000 * 25,
  })

  // 同步到 Zustand store
  useEffect(() => {
    if (query.data) {
      setPrices(query.data)
    }
  }, [query.data, setPrices])

  return {
    prices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    lastUpdatedAt: query.dataUpdatedAt,
    refresh: query.refetch,
  }
}
