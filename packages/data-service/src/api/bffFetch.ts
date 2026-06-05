// BFF 基础地址（开发环境通过 Vite 代理，生产环境直接访问）
const BFF_BASE = '/api'

interface BffFetchOptions {
  /** 请求头 */
  headers?: Record<string, string>
  /** 错误时的 fallback 值 */
  fallback?: unknown
  /** 错误日志前缀 */
  errorPrefix?: string
}

/**
 * 通用 BFF 请求函数
 * 统一处理 fetch + 错误处理 + 数据提取
 *
 * @param path API 路径（不含 BFF_BASE 前缀）
 * @param params URL 查询参数
 * @param options 配置选项
 * @returns 解析后的 data 字段，失败时返回 fallback
 */
export async function bffFetch<T>(
  path: string,
  params?: Record<string, string>,
  options: BffFetchOptions = {}
): Promise<T> {
  const { headers = {}, fallback, errorPrefix = 'BFF 请求' } = options

  try {
    // 构建相对路径 URL（确保 Vite 代理正常工作）
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : ''
    const url = `${BFF_BASE}${path}${searchParams}`

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`${errorPrefix}失败: HTTP ${response.status}`)
      return fallback as T
    }

    const data = await response.json()
    return (data.data ?? fallback) as T
  } catch (error) {
    console.error(`${errorPrefix}失败:`, error)
    return fallback as T
  }
}

/**
 * 安全数值转换，防止 NaN
 *
 * @param value 要转换的值
 * @param fallback 转换失败时的默认值
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}
