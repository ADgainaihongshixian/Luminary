/** 基金类型枚举 */
export type FundType =
  | 'stock' // 股票型
  | 'mix' // 混合型
  | 'bond' // 债券型
  | 'monetary' // 货币市场
  | 'index' // 指数型
  | 'qdii' // QDII
  | 'other' // 其他

/** 持仓录入方式 */
export type HoldingMode = 'amount' | 'shares'

/** 用户持仓基金 */
export interface PortfolioFund {
  id: string
  fundCode: string
  fundName: string
  fundType: FundType
  holdingMode: HoldingMode
  holdingAmount: number // 持仓金额（元），holdingMode='amount' 时有效
  holdingShares: number // 持有份额，holdingMode='shares' 时有效
  costNav: number | null // 买入成本净值（可选）
  groupId: string | null
  remark: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

/** 基金分组 */
export interface FundGroup {
  id: string
  name: string
  sortOrder: number
  createdAt: number
}

/** 基金实时估值数据（来自 API） */
export interface FundEstimate {
  fundCode: string
  fundName: string
  fundType: FundType
  nav: number // 最新净值
  navDate: string // 净值日期
  estimateNav: number // 实时估值
  estimateRate: number // 估值涨跌幅 (%)
  estimateTime: string // 估值时间
}

/** 基金搜索结果项 */
export interface FundSearchItem {
  fundCode: string
  fundName: string
  fundType: string
  nav: number
  navDate: string
}

/** 基金历史净值 */
export interface FundNavHistory {
  date: string
  nav: number // 单位净值
  accNav: number // 累计净值
  dayGrowth: number // 日增长率 (%)
}
