import { db } from '@/db/db'

/**
 * 导出全量数据为 JSON 文件
 * 包含：基金持仓、分组、预警、设置
 */
export async function exportData(): Promise<void> {
  const [portfolioFunds, fundGroups, priceAlerts, userSettings] = await Promise.all([
    db.portfolio_funds.toArray(),
    db.fund_groups.toArray(),
    db.price_alerts.toArray(),
    db.user_settings.toArray(),
  ])

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      portfolioFunds,
      fundGroups,
      priceAlerts,
      userSettings,
    },
  }

  const json = JSON.stringify(exportPayload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `luminary-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
