import type { FundType } from '../types/fund'

/** 基金类型映射 */
export const FUND_TYPE_LABEL: Record<FundType, string> = {
  stock: '股票型',
  mix: '混合型',
  bond: '债券型',
  monetary: '货币型',
  index: '指数型',
  qdii: 'QDII',
  other: '其他',
}
