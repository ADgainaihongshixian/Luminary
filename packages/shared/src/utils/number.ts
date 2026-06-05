/**
 * 安全数值转换，防止 NaN
 *
 * @param value 要转换的值
 * @param fallback 转换失败时的默认值
 * @returns 有效的数值
 *
 * @example
 * safeNumber('123') // 123
 * safeNumber('abc') // 0
 * safeNumber(null, -1) // -1
 * safeNumber(undefined) // 0
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/**
 * 判断数值是否为有效正数
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

/**
 * 安全除法，防止除以 0
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || !Number.isFinite(denominator)) return fallback
  const result = numerator / denominator
  return Number.isFinite(result) ? result : fallback
}
