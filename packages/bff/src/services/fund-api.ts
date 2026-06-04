/**
 * 天天基金非官方 API 适配器
 * 数据源：东方财富 / 天天基金网
 * 注意：非官方接口，可能存在被封风险
 */

interface FundSearchResult {
  fundCode: string
  fundName: string
  fundType: string
  nav: number
  navDate: string
}

interface FundEstimate {
  fundCode: string
  fundName: string
  fundType: string
  nav: number
  navDate: string
  estimateNav: number
  estimateRate: number
  estimateTime: string
}

interface FundNavEntry {
  date: string
  nav: number
  accNav: number
  dayGrowth: number
}

/**
 * 搜索基金
 * 数据源：天天基金搜索接口（返回 JSON）
 */
export async function searchFunds(keyword: string): Promise<FundSearchResult[]> {
  if (!keyword || keyword.length < 2) return []

  try {
    const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(keyword)}`
    const response = await fetch(url, {
      headers: {
        Referer: 'https://fund.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.error('Fund search HTTP error:', response.status)
      return []
    }

    const data = await response.json()

    if (!data.Datas) {
      console.error('Fund search no Datas:', JSON.stringify(data).slice(0, 200))
      return []
    }

    return data.Datas.slice(0, 10).map(
      (item: {
        CODE: string
        NAME: string
        FundBaseInfo?: { FTYPE?: string; DWJZ?: string | number; FSRQ?: string }
      }) => ({
        fundCode: item.CODE,
        fundName: item.NAME,
        fundType: item.FundBaseInfo?.FTYPE ?? '其他',
        nav: Number(item.FundBaseInfo?.DWJZ ?? 0),
        navDate: item.FundBaseInfo?.FSRQ ?? '',
      })
    )
  } catch (error) {
    console.error('Fund search error:', error)
    return []
  }
}

/**
 * 获取基金实时估值
 * 数据源：天天基金估值接口（返回 JSONP）
 */
export async function getFundEstimate(fundCode: string): Promise<FundEstimate | null> {
  try {
    const url = `http://fundgz.1234567.com.cn/js/${fundCode}.js`
    const response = await fetch(url, {
      headers: {
        Referer: 'http://fund.eastmoney.com/',
      },
    })

    if (!response.ok) return null

    const text = await response.text()
    // 解析 jsonpgz 格式: jsonpgz({...});
    const match = text.match(/jsonpgz\((.+)\)/)
    if (!match) return null

    const data = JSON.parse(match[1])

    // 尝试从搜索接口获取基金类型
    let fundType = '其他'
    try {
      const searchResults = await searchFunds(data.fundcode)
      if (searchResults.length > 0) {
        fundType = searchResults[0].fundType
      }
    } catch {
      // 静默失败，使用默认值
    }

    return {
      fundCode: data.fundcode,
      fundName: data.name,
      fundType,
      nav: parseFloat(data.dwjz ?? '0'),
      navDate: data.jzrq ?? '',
      estimateNav: parseFloat(data.gsz ?? '0'),
      estimateRate: parseFloat(data.gszzl ?? '0'),
      estimateTime: data.gztime ?? '',
    }
  } catch (error) {
    console.error('Fund estimate error:', error)
    return null
  }
}

/**
 * 获取基金历史净值
 * 数据源：天天基金历史净值接口（返回 JSONP）
 */
export async function getFundNavHistory(
  fundCode: string,
  page = 1,
  pageSize = 20
): Promise<FundNavEntry[]> {
  try {
    const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=cb&fundCode=${fundCode}&pageIndex=${page}&pageSize=${pageSize}`
    const response = await fetch(url, {
      headers: {
        Referer: 'http://fund.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) return []

    const text = await response.text()
    // 解析 JSONP: cb({...})
    const match = text.match(/cb\((.+)\)/)
    if (!match) return []

    const data = JSON.parse(match[1])

    if (!data.Data?.LSJZList) return []

    return data.Data.LSJZList.map(
      (item: { FSRQ: string; DWJZ: string; LJJZ: string; JZZZL: string }) => ({
        date: item.FSRQ,
        nav: parseFloat(item.DWJZ ?? '0'),
        accNav: parseFloat(item.LJJZ ?? '0'),
        dayGrowth: parseFloat(item.JZZZL ?? '0'),
      })
    )
  } catch (error) {
    console.error('Fund NAV history error:', error)
    return []
  }
}
