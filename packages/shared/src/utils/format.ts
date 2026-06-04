/**
 * 格式化数字为货币字符串
 * @param value 金额
 * @param decimals 小数位数，默认 2
 */
export function formatCurrency(value: number, decimals = 2): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化涨跌幅百分比
 * @param rate 涨跌幅（百分比值，如 1.5 表示 +1.5%）
 */
export function formatRate(rate: number): string {
  const prefix = rate > 0 ? '+' : ''
  return `${prefix}${rate.toFixed(2)}%`
}

/**
 * 格式化涨跌额
 * @param value 涨跌额
 * @param decimals 小数位数
 */
export function formatChange(value: number, decimals = 2): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(decimals)}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 格式化时间为 HH:mm:ss
 */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}
