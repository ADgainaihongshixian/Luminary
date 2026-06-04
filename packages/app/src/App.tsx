import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMetalPrices } from '@/hooks/useMetalPrices'
import { useFundEstimates } from '@/hooks/useFundEstimates'
import { useAlertChecker } from '@/hooks/useAlertChecker'
import { useAlertStore } from '@/store/useAlertStore'
import { useFundStore } from '@/store/useFundStore'
import { useEffect, useState, useCallback } from 'react'
import { METALS } from '@fund-monitor/shared'
import type { MetalSymbol } from '@fund-monitor/shared'
import {
  TrendingUp,
  Gem,
  Bell,
  Plus,
  ChevronRight,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Settings as SettingsIcon,
} from 'lucide-react'
import { MetalIcon } from '@/components/MetalIcon'
import { useTheme } from '@/hooks/useTheme'

// 路由懒加载
const FundList = lazy(() => import('@/pages/Funds/FundList').then((m) => ({ default: m.FundList })))
const FundDetail = lazy(() =>
  import('@/pages/Funds/FundDetail').then((m) => ({ default: m.FundDetail }))
)
const MetalList = lazy(() =>
  import('@/pages/Metals/MetalList').then((m) => ({ default: m.MetalList }))
)
const MetalDetail = lazy(() =>
  import('@/pages/Metals/MetalDetail').then((m) => ({ default: m.MetalDetail }))
)
const AlertList = lazy(() =>
  import('@/pages/Alerts/AlertList').then((m) => ({ default: m.AlertList }))
)
const Settings = lazy(() =>
  import('@/pages/Settings/Settings').then((m) => ({ default: m.Settings }))
)

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="h-5 w-24 bg-muted rounded" />
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
})

/** Dashboard 贵金属快捷行情（3张小卡） */
function MetalQuickCards() {
  const { prices } = useMetalPrices()

  return (
    <Link to="/metals" className="block h-full">
      <div className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Gem className="size-4" />
            <span>贵金属行情</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1 items-center">
          {(['XAU', 'XAG', 'XPT'] as MetalSymbol[]).map((symbol) => {
            const price = prices.find((p) => p.symbol === symbol)
            const info = METALS[symbol]
            const cnyPrice = Number.isFinite(price?.cnyPricePerGram) ? price!.cnyPricePerGram : 0
            const changePct = Number.isFinite(price?.changePercent) ? price!.changePercent : 0
            const isUp = changePct >= 0
            return (
              <div key={symbol} className="text-center">
                <div className="flex justify-center mb-1.5">
                  <MetalIcon symbol={symbol} size={36} />
                </div>
                <div className="text-xs text-muted-foreground mb-0.5">{info.name}</div>
                {price ? (
                  <>
                    <div className="font-mono text-sm font-medium">¥{cnyPrice.toFixed(0)}</div>
                    <div className={`font-mono text-xs ${isUp ? 'text-up' : 'text-down'}`}>
                      {isUp ? '▲' : '▼'}
                      {Math.abs(changePct).toFixed(2)}%
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-xs">--</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}

/** Dashboard 基金列表摘要（前5只） */
function FundTopList() {
  const { funds, loadFunds } = useFundStore()
  const { data: fundEstimates } = useFundEstimates(funds)

  useEffect(() => {
    loadFunds()
  }, [loadFunds])

  const topFunds = fundEstimates.slice(0, 5)

  if (funds.length === 0) {
    return (
      <Link to="/funds" className="block h-full">
        <div className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="size-4" />
              <span>基金持仓</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
          <div className="text-center py-6 text-muted-foreground text-sm flex-1 flex items-center justify-center">
            暂无持仓，点击添加基金
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to="/funds" className="block h-full">
      <div className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="size-4" />
            <span>基金持仓 ({funds.length})</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-2 flex-1">
          {topFunds.map(({ fund, estimate }) => {
            const isUp = (estimate?.estimateRate ?? 0) >= 0
            return (
              <div key={fund.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{fund.fundName}</div>
                  <div className="text-xs text-muted-foreground">{fund.fundCode}</div>
                </div>
                <div className="text-right ml-3">
                  {estimate ? (
                    <>
                      <div className="font-mono text-sm">{estimate.estimateNav.toFixed(4)}</div>
                      <div className={`font-mono text-xs ${isUp ? 'text-up' : 'text-down'}`}>
                        {isUp ? '▲' : '▼'}
                        {Math.abs(estimate.estimateRate).toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-xs">--</div>
                  )}
                </div>
              </div>
            )
          })}
          {funds.length > 5 && (
            <div className="text-center text-muted-foreground text-xs pt-1">
              还有 {funds.length - 5} 只基金...
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

/** Dashboard 资产总览 */
function AssetOverview() {
  const { funds, loadFunds } = useFundStore()
  const { data: fundEstimates } = useFundEstimates(funds)

  useEffect(() => {
    loadFunds()
  }, [loadFunds])

  const totalHolding = funds.reduce((sum, f) => {
    return sum + (f.holdingMode === 'amount' ? f.holdingAmount : 0)
  }, 0)

  const totalDailyProfit = fundEstimates.reduce((sum, { fund, estimate }) => {
    if (!estimate || fund.holdingMode !== 'amount') return sum
    return sum + (fund.holdingAmount * estimate.estimateRate) / 100
  }, 0)

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-muted-foreground text-xs mb-1">总持仓市值</div>
          <div className="font-mono text-2xl font-bold">¥{totalHolding.toLocaleString()}</div>
          <div className="text-muted-foreground text-xs">{funds.length} 只基金</div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs mb-1">今日基金收益</div>
          <div
            className={`font-mono text-2xl font-bold ${totalDailyProfit >= 0 ? 'text-up' : 'text-down'}`}
          >
            {totalDailyProfit >= 0 ? '+' : ''}
            {totalDailyProfit.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-xs">元</div>
        </div>
      </div>
    </div>
  )
}

/** Dashboard 预警状态（全宽） */
function AlertStatus() {
  const { alerts, loadAlerts } = useAlertStore()

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const activeCount = alerts.filter((a) => a.status === 'active').length
  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered')
  const totalCount = alerts.length

  return (
    <Link to="/alerts" className="block">
      <div className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Bell className="size-4" />
            <span>价格预警</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-6 mt-3">
          {/* 监控中 */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold">{activeCount}</span>
            <span className="text-muted-foreground text-xs">条监控中</span>
          </div>

          {/* 分隔线 */}
          <div className="h-8 w-px bg-border/50" />

          {/* 已触发 */}
          {triggeredAlerts.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 animate-pulse">
              <span>🔔</span>
              <span className="font-mono text-sm font-medium text-destructive">
                {triggeredAlerts.length} 条已触发
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">暂无触发</div>
          )}

          {/* 分隔线 */}
          <div className="h-8 w-px bg-border/50" />

          {/* 总数 */}
          <div className="text-muted-foreground text-xs">共 {totalCount} 条规则</div>
        </div>
      </div>
    </Link>
  )
}

/** 主题切换快捷按钮 */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
  }
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  const label = theme === 'dark' ? '暗色' : theme === 'light' ? '亮色' : '跟随系统'

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} title={`当前：${label}，点击切换`}>
      <Icon className="size-4" />
    </Button>
  )
}

/** 手动刷新按钮 */
function RefreshButton() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ['metalPrices'] }),
      queryClient.invalidateQueries({ queryKey: ['fundEstimate'] }),
    ])
    setTimeout(() => setIsRefreshing(false), 500)
  }, [queryClient])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="手动刷新数据"
    >
      <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>
  )
}

function Dashboard() {
  useAlertChecker()

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* 顶部栏：Logo + 操作按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">流光</h1>
          <p className="text-muted-foreground text-xs mt-0.5">基金 & 贵金属实时监控平台</p>
        </div>
        <div className="flex items-center gap-1">
          <RefreshButton />
          <ThemeToggle />
          <Link to="/settings">
            <Button variant="ghost" size="icon" title="设置">
              <SettingsIcon className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 资产总览 */}
      <AssetOverview />

      {/* 主内容区：基金 + 贵金属 并排 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
        {/* 基金持仓 */}
        <FundTopList />

        {/* 贵金属行情 */}
        <MetalQuickCards />
      </div>

      {/* 价格预警（全宽） */}
      <div className="mt-4">
        <AlertStatus />
      </div>

      {/* 快捷操作 */}
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <Link to="/funds">
          <Button variant="default" size="lg">
            <Plus className="size-4" />
            添加基金
          </Button>
        </Link>
        <Link to="/metals">
          <Button variant="outline" size="lg">
            <Gem className="size-4" />
            贵金属行情
          </Button>
        </Link>
        <Link to="/alerts">
          <Button variant="outline" size="lg">
            <Bell className="size-4" />
            价格预警
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/funds" element={<FundList />} />
              <Route path="/funds/:code" element={<FundDetail />} />
              <Route path="/metals" element={<MetalList />} />
              <Route path="/metals/:symbol" element={<MetalDetail />} />
              <Route path="/alerts" element={<AlertList />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
