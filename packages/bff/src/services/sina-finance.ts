/**
 * 新浪财经 API 适配器
 *
 * 优势：国内直连、速度快（~350ms）、免费、无需 API Key
 *
 * 数据源：
 * - 实时价格：hq.sinajs.cn（国际现货金银）
 * - 历史 K 线：stock.finance.sina.com.cn（国内期货 AU0/AG0）
 *
 * 注意：
 * - 新浪不提供铂金（XPT）和钯金（XPD）数据
 * - 历史数据为国内期货价格（CNY/克），需换算为 USD/盎司以保持一致性
 */

const TROY_OZ_TO_GRAM = 31.1035

/** 新浪国际现货金属代码 */
const SINA_SPOT_SYMBOLS: Record<string, string> = {
  XAU: 'hf_XAU',
  XAG: 'hf_XAG',
}

/** 新浪期货代码（用于历史 K 线） */
const SINA_FUTURES_SYMBOLS: Record<string, string> = {
  XAU: 'AU0', // 沪金主力
  XAG: 'AG0', // 沪银主力
}

export interface SinaRealtimePrice {
  symbol: string
  price: number // USD/oz
  open: number // USD/oz
  high: number // USD/oz
  low: number // USD/oz
  prevClose: number // USD/oz
  change: number
  changePercent: number
  updatedAt: string
}

export interface SinaHistoryEntry {
  date: string
  open: number // USD/oz
  high: number // USD/oz
  low: number // USD/oz
  close: number // USD/oz
}

/**
 * 获取新浪财经实时价格
 * 返回国际现货金银价格（USD/oz）
 */
export async function getSinaRealtimePrice(symbol: string): Promise<SinaRealtimePrice | null> {
  const sinaSymbol = SINA_SPOT_SYMBOLS[symbol]
  if (!sinaSymbol) return null

  try {
    const response = await fetch(`https://hq.sinajs.cn/list=${sinaSymbol}`, {
      headers: {
        Referer: 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!response.ok) return null

    const text = await response.text()
    return parseSinaRealtime(symbol, text)
  } catch (error) {
    console.error(`新浪财经 ${symbol} 实时价格获取失败:`, error)
    return null
  }
}

/**
 * 批量获取新浪财经实时价格
 */
export async function getSinaRealtimePrices(symbols: string[]): Promise<SinaRealtimePrice[]> {
  const sinaSymbols = symbols.filter((s) => SINA_SPOT_SYMBOLS[s]).map((s) => SINA_SPOT_SYMBOLS[s])

  if (sinaSymbols.length === 0) return []

  try {
    const response = await fetch(`https://hq.sinajs.cn/list=${sinaSymbols.join(',')}`, {
      headers: {
        Referer: 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!response.ok) return []

    const text = await response.text()
    const lines = text.trim().split('\n')
    const results: SinaRealtimePrice[] = []

    for (const line of lines) {
      // 解析 var hq_str_hf_XAU="...";
      const match = line.match(/hq_str_(\w+)="(.+)"/)
      if (!match) continue

      const sinaCode = match[1]
      const symbol = Object.entries(SINA_SPOT_SYMBOLS).find(([, v]) => v === sinaCode)?.[0]
      if (!symbol) continue

      const parsed = parseSinaRealtime(symbol, line)
      if (parsed) results.push(parsed)
    }

    return results
  } catch (error) {
    console.error('新浪财经批量实时价格获取失败:', error)
    return []
  }
}

/**
 * 解析新浪实时价格数据
 * hf_XAU 格式（实测）：
 *   0:当前价, 1:昨收, 2:开盘, 3:?, 4:最高, 5:最低, 6:时间,
 *   7:昨收, 8:开盘价, 9-11:0, 12:日期, 13:品种名
 */
function parseSinaRealtime(symbol: string, text: string): SinaRealtimePrice | null {
  const match = text.match(/"(.+)"/)
  if (!match) return null

  const parts = match[1].split(',')
  if (parts.length < 10) return null

  const price = Number(parts[0]) // 当前价
  const prevClose = Number(parts[1]) // 昨收
  const open = Number(parts[2]) // 开盘
  const high = Number(parts[4]) // 最高
  const low = Number(parts[5]) // 最低

  if (!Number.isFinite(price) || price <= 0) return null

  const change = Number.isFinite(prevClose) && prevClose > 0 ? +(price - prevClose).toFixed(2) : 0
  const changePercent = prevClose > 0 ? +((change / prevClose) * 100).toFixed(2) : 0

  // 日期在倒数第二个字段，时间在第6个字段
  const dateStr = parts.length > 12 ? parts[12] : ''
  const timeStr = parts[6] ?? ''

  return {
    symbol,
    price,
    open: Number.isFinite(open) && open > 0 ? open : price,
    high: Number.isFinite(high) && high > 0 ? high : price,
    low: Number.isFinite(low) && low > 0 ? low : price,
    prevClose: Number.isFinite(prevClose) && prevClose > 0 ? prevClose : price,
    change,
    changePercent,
    updatedAt: `${dateStr} ${timeStr}`.trim(),
  }
}

/**
 * 获取历史 K 线数据
 * 使用新浪期货 API（国内期货 AU0/AG0），返回换算后的 USD/oz
 */
export async function getSinaHistory(
  symbol: string,
  exchangeRate: number
): Promise<SinaHistoryEntry[]> {
  const futuresSymbol = SINA_FUTURES_SYMBOLS[symbol]
  if (!futuresSymbol) return []

  try {
    const url = `https://stock.finance.sina.com.cn/futures/api/jsonp.php/var/InnerFuturesNewService.getDailyKLine?symbol=${futuresSymbol}`
    const response = await fetch(url, {
      headers: {
        Referer: 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!response.ok) return []

    const text = await response.text()
    return parseSinaHistory(symbol, text, exchangeRate)
  } catch (error) {
    console.error(`新浪期货 ${symbol} 历史数据获取失败:`, error)
    return []
  }
}

/**
 * 解析新浪期货历史 K 线
 * 格式：var xxx = [{"d":"日期","o":"开","h":"高","l":"低","c":"收盘","v":"成交量","p":"持仓"}, ...]
 * 期货价格单位：CNY/克 → 需换算为 USD/盎司
 */
function parseSinaHistory(_symbol: string, text: string, exchangeRate: number): SinaHistoryEntry[] {
  // 提取 JSON 数组（跳过 var(...) 包裹）
  const match = text.match(/\[.+\]/s)
  if (!match) return []

  let rows: { d: string; o: string; h: string; l: string; c: string }[]
  try {
    rows = JSON.parse(match[0])
  } catch {
    return []
  }

  const rate = exchangeRate > 0 ? exchangeRate : 7.2
  // CNY/克 → USD/盎司
  const toUsdOz = (v: number) => +((v * TROY_OZ_TO_GRAM) / rate).toFixed(2)

  const entries: SinaHistoryEntry[] = []

  for (const row of rows) {
    const o = Number(row.o)
    const h = Number(row.h)
    const l = Number(row.l)
    const c = Number(row.c)

    if (!Number.isFinite(o) || !Number.isFinite(c) || c <= 0) continue

    entries.push({
      date: row.d,
      open: toUsdOz(o),
      high: toUsdOz(h),
      low: toUsdOz(l),
      close: toUsdOz(c),
    })
  }

  return entries
}
