import Dexie, { type EntityTable } from 'dexie'
import type { PortfolioFund, FundGroup, PriceAlert, UserSetting } from '@fund-monitor/shared'

/**
 * 「流光」本地数据库
 * 使用 Dexie.js 封装 IndexedDB，存储用户持仓、分组、预警、设置
 */
const db = new Dexie('LuminaryDB') as Dexie & {
  portfolio_funds: EntityTable<PortfolioFund, 'id'>
  fund_groups: EntityTable<FundGroup, 'id'>
  price_alerts: EntityTable<PriceAlert, 'id'>
  user_settings: EntityTable<UserSetting, 'key'>
}

db.version(1).stores({
  portfolio_funds: 'id, fundCode, fundType, groupId, sortOrder, createdAt',
  fund_groups: 'id, sortOrder, createdAt',
  price_alerts: 'id, assetType, assetCode, status, createdAt',
  user_settings: 'key',
})

export { db }
