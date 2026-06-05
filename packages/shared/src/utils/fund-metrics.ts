import type { PortfolioFund, FundEstimate } from '../types/fund'
import { calcDailyProfit, calcTotalProfit, calcTotalProfitRate, calcShares } from './price'
import { safeNumber } from './number'

export interface FundMetrics {
  /** 当日浮盈（元） */
  dailyProfit: number | null
  /** 持有份额 */
  shares: number | null
  /** 累计收益（元） */
  totalProfit: number | null
  /** 累计收益率（%） */
  totalProfitRate: number | null
}

/**
 * 计算基金的各项收益指标
 *
 * @param fund 基金持仓信息
 * @param estimate 基金估值信息（可选）
 * @returns 收益指标对象
 */
export function calculateFundMetrics(fund: PortfolioFund, estimate?: FundEstimate): FundMetrics {
  const result: FundMetrics = {
    dailyProfit: null,
    shares: null,
    totalProfit: null,
    totalProfitRate: null,
  }

  // 计算持有份额
  if (fund.holdingMode === 'shares') {
    result.shares = fund.holdingShares
  } else if (fund.holdingMode === 'amount' && fund.costNav && fund.costNav > 0) {
    result.shares = calcShares(fund.holdingAmount, fund.costNav)
  }

  // 计算当日浮盈
  if (estimate?.estimateRate !== undefined && estimate.estimateRate !== null) {
    result.dailyProfit = calcDailyProfit(fund.holdingAmount, safeNumber(estimate.estimateRate))
  }

  // 计算累计收益（需要成本净值和当前净值）
  const currentNav = estimate?.nav ?? estimate?.estimateNav
  if (result.shares && fund.costNav && currentNav) {
    result.totalProfit = calcTotalProfit(currentNav, fund.costNav, result.shares)
    result.totalProfitRate = calcTotalProfitRate(currentNav, fund.costNav)
  }

  return result
}
