import { useNavigate } from 'react-router-dom'
import { useMetalPrices } from '@/hooks/useMetalPrices'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { MetalCard } from './MetalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Gem, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/PageContainer'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'

/** 判断是否为周末（伦敦金市场休市） */
function isWeekend() {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

export function MetalList() {
  const navigate = useNavigate()
  const { prices, isLoading, isError, lastUpdatedAt, refresh } = useMetalPrices()
  const { rate } = useExchangeRate()
  const weekend = isWeekend()

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader
        title="贵金属行情"
        subtitle="实时监控黄金、白银、铂金国际价格"
        backTo="/"
        actions={
          rate ? (
            <div className="text-right">
              <div className="text-muted-foreground text-xs">实时汇率</div>
              <div className="font-mono text-sm font-medium">
                1 USD = {rate.rate.toFixed(4)} CNY
              </div>
            </div>
          ) : undefined
        }
      />

      {/* 周末休市提示 */}
      {weekend && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
          ⚠️ 周末伦敦金市场休市，显示的是上一交易日收盘价
        </div>
      )}

      {/* 刷新控制栏 */}
      <div className="flex items-center justify-between text-muted-foreground text-xs mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="size-3 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{weekend ? '休市中' : '每 30 秒自动刷新'}</span>
          {lastUpdatedAt > 0 && (
            <span className="ml-1">
              · 更新于 {new Date(lastUpdatedAt).toLocaleTimeString('zh-CN')}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
          <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          手动刷新
        </Button>
      </div>

      {/* 贵金属卡片 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : isError && prices.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="数据加载失败"
          description="请检查网络连接或稍后重试"
          variant="muted"
          action={{
            label: '重试',
            onClick: () => refresh(),
            icon: RefreshCw,
          }}
        />
      ) : prices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prices.map((price) => (
            <MetalCard key={price.symbol} price={price} onClick={(s) => navigate(`/metals/${s}`)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Gem}
          title="暂无行情数据"
          description="请检查网络连接或稍后重试"
          variant="accent"
        />
      )}

      {/* 换算提示 */}
      <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
        <h4 className="text-sm font-medium mb-2">💡 价格换算说明</h4>
        <div className="text-muted-foreground text-xs space-y-1">
          <p>人民币克价 = 美元盎司价 ÷ 31.1035 × USD/CNY 汇率</p>
          <p>1 金衡盎司 (troy oz) = 31.1035 克</p>
          <p className="mt-2 opacity-70">
            数据来源：金银-新浪财经 · 铂金/钯金-Gold-API · 历史数据-新浪期货 · 汇率-Open Exchange
            Rates
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
