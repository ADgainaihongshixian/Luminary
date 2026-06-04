import { useQuery } from '@tanstack/react-query'
import { searchFunds } from '@fund-monitor/data-service'
import { useState, useEffect } from 'react'

/**
 * 基金搜索 hook
 * 自带 debounce 300ms，关键词 ≥2 字时触发搜索
 */
export function useFundSearch() {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  // debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

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
