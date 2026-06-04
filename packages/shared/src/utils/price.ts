import { TROY_OZ_TO_GRAM } from '../constants/metals'

/**
 * 美元盎司价 → 人民币克价
 * @param usdPerOz 美元/盎司价格
 * @param usdCnyRate 美元兑人民币汇率
 * @returns 人民币/克价格
 */
export function usdOzToCnyGram(usdPerOz: number, usdCnyRate: number): number {
  return (usdPerOz / TROY_OZ_TO_GRAM) * usdCnyRate
}

/**
 * 计算当日浮盈（元）
 * @param holdingAmount 持仓金额（元）
 * @param estimateRate 估值涨跌幅（%）
 */
export function calcDailyProfit(holdingAmount: number, estimateRate: number): number {
  return (holdingAmount * estimateRate) / 100
}

/**
 * 计算累计收益（元）
 * @param currentNav 当前净值
 * @param costNav 买入成本净值
 * @param shares 持有份额
 */
export function calcTotalProfit(currentNav: number, costNav: number, shares: number): number {
  return (currentNav - costNav) * shares
}

/**
 * 计算累计收益率（%）
 * @param currentNav 当前净值
 * @param costNav 买入成本净值
 */
export function calcTotalProfitRate(currentNav: number, costNav: number): number {
  if (costNav === 0) return 0
  return (currentNav / costNav - 1) * 100
}

/**
 * 按金额录入时计算持仓份额
 * @param amount 买入金额
 * @param costNav 买入成本净值
 */
export function calcShares(amount: number, costNav: number): number {
  if (costNav === 0) return 0
  return amount / costNav
}

/**
 * 计算涨跌额
 * @param current 当前价
 * @param reference 参考价（昨收/开盘）
 */
export function calcChange(current: number, reference: number): number {
  return current - reference
}

/**
 * 计算涨跌幅（%）
 * @param current 当前价
 * @param reference 参考价
 */
export function calcChangePercent(current: number, reference: number): number {
  if (reference === 0) return 0
  return ((current - reference) / reference) * 100
}
