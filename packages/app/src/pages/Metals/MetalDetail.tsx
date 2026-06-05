import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { MetalSymbol, MetalOHLC } from '@fund-monitor/shared'
import { METALS, DEFAULT_METAL_SYMBOLS, usdOzToCnyGram } from '@fund-monitor/shared'
import { getMetalPrices, getMetalHistory } from '@fund-monitor/data-service'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { MetalKlineChart } from '@/components/charts/MetalKlineChart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Calculator } from 'lucide-react'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/PageContainer'
import { PageHeader } from '@/components/PageHeader'

const TIME_RANGES = [
  { label: '1天', value: '1D' },
  { label: '1周', value: '1W' },
  { label: '1月', value: '1M' },
  { label: '3月', value: '3M' },
  { label: '1年', value: '1Y' },
]

export function MetalDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const metalSymbol = (symbol?.toUpperCase() ?? 'XAU') as MetalSymbol
  const metalInfo = METALS[metalSymbol]
  const { rate: exchangeRate } = useExchangeRate()
  const { colorScheme } = useColorScheme()
  const usdCnyRate = exchangeRate?.rate ?? 7.18

  const [range, setRange] = useState('1M')
  const [ohlcData, setOhlcData] = useState<MetalOHLC[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [high52w, setHigh52w] = useState(0)
  const [low52w, setLow52w] = useState(0)

  // 换算器状态
  const [gramInput, setGramInput] = useState('10')

  useEffect(() => {
    if (!metalSymbol || !DEFAULT_METAL_SYMBOLS.includes(metalSymbol)) return
    setIsLoading(true)

    getMetalPrices([metalSymbol]).then((prices) => {
      const p = prices[0]
      if (p) setCurrentPrice(p.price)
    })

    getMetalHistory(metalSymbol, range).then((data) => {
      setOhlcData(data)
      if (data.length > 0) {
        const highs = data.map((d) => d.high)
        const lows = data.map((d) => d.low)
        setHigh52w(Math.max(...highs))
        setLow52w(Math.min(...lows))
      }
      setIsLoading(false)
    })
  }, [metalSymbol, range])

  if (!metalInfo) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        不支持的贵金属品种
      </div>
    )
  }

  const priceRange = high52w - low52w
  const pricePosition =
    currentPrice && priceRange > 0 ? ((currentPrice - low52w) / priceRange) * 100 : 50

  const grams = Number(gramInput) || 0
  const ounces = grams / 31.1035
  const cnyValue = currentPrice ? usdOzToCnyGram(currentPrice, usdCnyRate) * grams : 0
  const usdValue = currentPrice ? ounces * currentPrice : 0

  // BFF 返回正序（最老在前），图表直接使用，表格需要倒序（最新在前）
  const tableData = [...ohlcData].reverse()

  // 动态标题
  const rangeLabel = TIME_RANGES.find((r) => r.value === range)?.label ?? range

  return (
    <PageContainer>
      {/* 顶部导航 */}
      <PageHeader
        title={`${metalInfo.name} (${metalInfo.symbol})`}
        subtitle={`${metalInfo.nameEn} · ${metalInfo.unit}`}
        backTo={-1}
      />

      {/* 当前价格 */}
      {currentPrice && (
        <div className="glass-card p-4 mb-4">
          <div className="flex items-end gap-4">
            <div>
              <div className="text-muted-foreground text-xs mb-1">美元价格</div>
              <div className="font-mono text-3xl font-bold">${currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">人民币克价</div>
              <div className="font-mono text-2xl font-bold text-primary">
                ¥{usdOzToCnyGram(currentPrice, usdCnyRate).toFixed(2)}/g
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-muted-foreground text-xs">实时汇率</div>
              <div className="font-mono text-sm">1 USD = {usdCnyRate.toFixed(4)} CNY</div>
            </div>
          </div>
        </div>
      )}

      {/* 时间范围切换 */}
      <Tabs value={range} onValueChange={setRange} className="mb-4">
        <TabsList>
          {TIME_RANGES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* K 线图 */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">K 线走势</h3>
          {ohlcData.length > 0 && (
            <span className="text-xs text-muted-foreground">数据来源：新浪财经</span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="w-full h-[350px] rounded-lg" />
        ) : ohlcData.length > 0 ? (
          <MetalKlineChart data={ohlcData} height={350} colorScheme={colorScheme} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <p className="text-muted-foreground text-sm mb-2">暂无历史数据</p>
            <p className="text-muted-foreground text-xs">请检查网络连接或稍后重试</p>
          </div>
        )}
      </div>

      {/* 52 周价格区间 */}
      {high52w > 0 && (
        <div className="glass-card p-4 mb-4">
          <h3 className="text-sm font-medium mb-3">价格区间</h3>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-down">${low52w.toFixed(2)}</span>
            <div className="flex-1 relative">
              <Progress value={pricePosition} className="h-2" />
              {currentPrice && (
                <div
                  className="absolute top-0 w-2 h-2 bg-primary rounded-full -translate-x-1/2"
                  style={{ left: `${pricePosition}%` }}
                />
              )}
            </div>
            <span className="text-up">${high52w.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 历史价格表格 */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-sm font-medium mb-3">
          历史价格（{rangeLabel}）· {tableData.length} 条
        </h3>
        {tableData.length > 0 ? (
          <div className="max-h-[350px] overflow-y-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">开盘</TableHead>
                  <TableHead className="text-right">最高</TableHead>
                  <TableHead className="text-right">最低</TableHead>
                  <TableHead className="text-right">收盘</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((d) => {
                  const isUp = d.close >= d.open
                  return (
                    <TableRow key={d.date}>
                      <TableCell className="font-mono text-xs">{d.date}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        ${d.open.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-up">
                        ${d.high.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-down">
                        ${d.low.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end gap-1 font-mono text-sm ${isUp ? 'text-up' : 'text-down'}`}
                        >
                          {isUp ? (
                            <TrendingUp className="size-3.5" />
                          ) : (
                            <TrendingDown className="size-3.5" />
                          )}
                          ${d.close.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">暂无数据</div>
        )}
      </div>

      {/* 换算计算器 */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Calculator className="size-4" />
          换算计算器
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs">输入克数</label>
            <Input
              type="number"
              value={gramInput}
              onChange={(e) => setGramInput(e.target.value)}
              min="0"
              step="1"
              placeholder="输入克数"
            />
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-muted-foreground text-xs">盎司</div>
              <div className="font-mono text-lg font-medium">{ounces.toFixed(4)} oz</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-muted-foreground text-xs">美元价值</div>
              <div className="font-mono text-lg font-medium">${usdValue.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-muted-foreground text-xs">人民币价值</div>
              <div className="font-mono text-lg font-bold text-primary">¥{cnyValue.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-xs mt-3">
          汇率: 1 USD = {usdCnyRate.toFixed(4)} CNY · 1 金衡盎司 = 31.1035 克
        </p>
      </div>
    </PageContainer>
  )
}
