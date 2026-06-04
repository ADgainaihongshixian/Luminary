/** 预警资产类型 */
export type AlertAssetType = 'metal' | 'fund'

/** 预警状态 */
export type AlertStatus = 'active' | 'triggered'

/** 价格预警规则 */
export interface PriceAlert {
  id: string
  assetType: AlertAssetType
  assetCode: string // 品种代码（如 'XAU' 或基金代码 '110011'）
  assetName: string // 展示名称
  targetPrice: number // 目标价格
  priceUnit: string // 价格单位（如 'CNY/g', '元'）
  status: AlertStatus
  triggeredAt: number | null
  createdAt: number
}
