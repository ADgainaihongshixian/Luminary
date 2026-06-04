import type { MetalInfo, MetalSymbol } from '../types/metal'

/** 支持的贵金属品种 */
export const METALS: Record<MetalSymbol, MetalInfo> = {
  XAU: {
    symbol: 'XAU',
    name: '黄金',
    nameEn: 'Gold',
    unit: 'USD/oz',
  },
  XAG: {
    symbol: 'XAG',
    name: '白银',
    nameEn: 'Silver',
    unit: 'USD/oz',
  },
  XPT: {
    symbol: 'XPT',
    name: '铂金',
    nameEn: 'Platinum',
    unit: 'USD/oz',
  },
  XPD: {
    symbol: 'XPD',
    name: '钯金',
    nameEn: 'Palladium',
    unit: 'USD/oz',
  },
}

/** 金衡盎司 → 克 换算常数 */
export const TROY_OZ_TO_GRAM = 31.1035

/** 默认展示的贵金属（不含钯金） */
export const DEFAULT_METAL_SYMBOLS: MetalSymbol[] = ['XAU', 'XAG', 'XPT']
