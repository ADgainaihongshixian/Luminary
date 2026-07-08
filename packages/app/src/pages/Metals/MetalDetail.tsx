import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { MetalSymbol } from '@fund-monitor/shared'
import { METALS, DEFAULT_METAL_SYMBOLS, usdOzToCnyGram } from '@fund-monitor/shared'
import { getMetalHistory } from '@fund-monitor/data-service'
import { useMetalPrices } from '@/hooks/useMetalPrices'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { useQuery } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Calculator, RefreshCw } from 'lucide-react'
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

/** 判断是否为周末（伦敦金市场休市） */
function isWeekend() {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

export function MetalDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const metalSymbol = (symbol?.toUpperCase() ?? 'XAU') as MetalSymbol
  const metalInfo = METALS[metalSymbol]
  const { rate: exchangeRate } = useExchangeRate()
  const { colorScheme } = useColorScheme()
  const usdCnyRate = exchangeRate?.rate ?? 7.18

  const [range, setRange] = useState('1D')
  // 换算器状态
  const [gramInput, setGramInput] = useState('10')

  const weekend = isWeekend()

  // 实时价格：复用 useMetalPrices，共享 30s 自动刷新（useMetalPrices 内部已有轮询）
  const { prices, refresh: refreshPrices } = useMetalPrices()
  const currentPrice = prices.find((p) => p.symbol === metalSymbol)?.price ?? null

  // 历史数据：TanStack Query 包装，休市时停止轮询
  const is1D = range === '1D'
  const {
    data: ohlcData = [],
    isLoading,
    dataUpdatedAt: historyUpdatedAt,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['metalHistory', metalSymbol, range],
    queryFn: () => getMetalHistory(metalSymbol, range),
    enabled: !!metalSymbol && DEFAULT_METAL_SYMBOLS.includes(metalSymbol),
    refetchInterval: weekend ? false : is1D ? 1000 * 30 : 1000 * 60 * 5,
    staleTime: is1D ? 1000 * 25 : 1000 * 60 * 4,
  })

  // 从历史数据计算价格区间
  const high52w = ohlcData.length > 0 ? Math.max(...ohlcData.map((d) => d.high)) : 0
  const low52w = ohlcData.length > 0 ? Math.min(...ohlcData.map((d) => d.low)) : 0

  // 手动刷新：同时更新价格和历史数据
  const handleRefresh = async () => {
    await Promise.allSettled([refreshPrices(), refetchHistory()])
  }

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

  // 1D 用分时折线图，其他用 K 线图
  const chartType = range === '1D' ? 'line' : 'candlestick'

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

      {/* K 线图 / 分时图 */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium">{chartType === 'line' ? '分时走势' : 'K 线走势'}</h3>
          <div className="flex items-center gap-2">
            {ohlcData.length > 0 && (
              <span className="text-xs text-muted-foreground">数据来源：新浪财经</span>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          {weekend ? (
            <span>⚠️ 周末休市，显示上一交易日数据</span>
          ) : (
            <>
              <RefreshCw className="size-3 animate-spin" style={{ animationDuration: '3s' }} />
              <span>每 {is1D ? '30 秒' : '5 分钟'}自动刷新</span>
            </>
          )}
          {historyUpdatedAt > 0 && (
            <span>· 更新于 {new Date(historyUpdatedAt).toLocaleTimeString('zh-CN')}</span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="w-full h-[350px] rounded-lg" />
        ) : ohlcData.length > 0 ? (
          <MetalKlineChart
            data={ohlcData}
            height={350}
            colorScheme={colorScheme}
            chartType={chartType}
          />
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
                  <TableHead>{chartType === 'line' ? '时间' : '日期'}</TableHead>
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
