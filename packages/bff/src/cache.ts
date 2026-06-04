/**
 * 简单的内存缓存工具
 * 用于减少对第三方 API 的重复请求
 */

const cache = new Map<string, { data: unknown; expires: number }>()

interface CacheOptions {
  /** 缓存时间（秒） */
  ttl: number
}

/**
 * 带缓存的数据获取
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param options 缓存选项
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key)

  // 命中缓存且未过期
  if (cached && cached.expires > now) {
    return cached.data as T
  }

  // 获取新数据
  const data = await fetcher()

  // 写入缓存
  cache.set(key, {
    data,
    expires: now + options.ttl * 1000,
  })

  return data
}

/** 清除所有缓存 */
export function clearCache() {
  cache.clear()
}

/** 清除指定键的缓存 */
export function invalidateCache(key: string) {
  cache.delete(key)
}
