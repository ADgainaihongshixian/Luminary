/** 贵金属品种代码 */
export type MetalSymbol = 'XAU' | 'XAG' | 'XPT' | 'XPD'

/** 贵金属品种信息 */
export interface MetalInfo {
  symbol: MetalSymbol
  name: string
  nameEn: string
  unit: string // 'USD/oz'
}

/** 贵金属实时价格 */
export interface MetalPrice {
  symbol: MetalSymbol
  price: number // 当前美元价格 (USD/oz)
  cnyPricePerGram: number // 人民币克价 (CNY/g)
  open: number // 今日开盘价
  high: number // 今日最高
  low: number // 今日最低
  prevClose: number // 昨日收盘价
  change: number // 较昨收涨跌额 (USD)
  changePercent: number // 较昨收涨跌幅 (%)
  dayChange: number // 较今日开盘涨跌额 (USD)
  dayChangePercent: number // 较今日开盘涨跌幅 (%)
  updatedAt: number // 更新时间戳
}

/** 汇率数据 */
export interface ExchangeRate {
  from: string
  to: string
  rate: number
  updatedAt: number
}

/** 贵金属历史 OHLC */
export interface MetalOHLC {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}
