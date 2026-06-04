import { db } from '@/db/db'
import type { PortfolioFund, FundGroup, PriceAlert } from '@fund-monitor/shared'

interface ImportPayload {
  version: number
  exportedAt: string
  data: {
    portfolioFunds: PortfolioFund[]
    fundGroups: FundGroup[]
    priceAlerts: PriceAlert[]
    userSettings: { key: string; value: unknown }[]
  }
}

/**
 * 从 JSON 文件导入数据
 * 导入前会清空现有数据
 */
export async function importData(file: File): Promise<void> {
  const text = await file.text()
  const payload: ImportPayload = JSON.parse(text)

  // 版本校验
  if (!payload.version || !payload.data) {
    throw new Error('无效的备份文件格式')
  }

  // 清空现有数据
  await Promise.all([
    db.portfolio_funds.clear(),
    db.fund_groups.clear(),
    db.price_alerts.clear(),
    db.user_settings.clear(),
  ])

  // 写入新数据
  const { portfolioFunds, fundGroups, priceAlerts, userSettings } = payload.data

  await Promise.all([
    portfolioFunds.length > 0 ? db.portfolio_funds.bulkAdd(portfolioFunds) : Promise.resolve(),
    fundGroups.length > 0 ? db.fund_groups.bulkAdd(fundGroups) : Promise.resolve(),
    priceAlerts.length > 0 ? db.price_alerts.bulkAdd(priceAlerts) : Promise.resolve(),
    userSettings.length > 0 ? db.user_settings.bulkAdd(userSettings) : Promise.resolve(),
  ])
}
