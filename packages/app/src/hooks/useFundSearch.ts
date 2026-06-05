import { useQuery } from '@tanstack/react-query'
import { searchFunds } from '@fund-monitor/data-service'
import { useState } from 'react'
import { useDebounce } from './useDebounce'

/**
 * 基金搜索 hook
 * 自带 debounce 300ms，关键词 ≥2 字时触发搜索
 */
export function useFundSearch() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)

  const query = useQuery({
    queryKey: ['fundSearch', debouncedKeyword],
    queryFn: () => searchFunds(debouncedKeyword),
    enabled: debouncedKeyword.length >= 2,
    staleTime: 1000 * 60 * 5, // 搜索结果缓存 5 分钟
  })

  return {
    keyword,
    setKeyword,
    results: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
