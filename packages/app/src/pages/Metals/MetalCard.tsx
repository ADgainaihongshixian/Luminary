import type { MetalPrice, MetalSymbol } from '@fund-monitor/shared'
import { METALS } from '@fund-monitor/shared'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { MetalIcon } from '@/components/MetalIcon'

interface MetalCardProps {
  price: MetalPrice
  onClick?: (symbol: MetalSymbol) => void
}

export function MetalCard({ price, onClick }: MetalCardProps) {
  const info = METALS[price.symbol]
  const safeChangePct = Number.isFinite(price.changePercent) ? price.changePercent : 0
  const safeDayChangePct = Number.isFinite(price.dayChangePercent) ? price.dayChangePercent : 0
  const isUp = safeChangePct >= 0
  const isDayUp = safeDayChangePct >= 0

  return (
    <Card
      className="glass-card border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => onClick?.(price.symbol)}
    >
      <CardContent className="p-5">
        {/* 头部：品种名称 */}
        <div className="flex items-center gap-3 mb-4">
          <MetalIcon symbol={price.symbol} size={44} />
          <div>
            <h3 className="font-medium">{info.name}</h3>
            <span className="text-muted-foreground text-xs">
              {info.nameEn} ({info.symbol})
            </span>
          </div>
        </div>

        {/* 核心价格 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 美元价格 */}
          <div>
            <div className="text-muted-foreground text-xs mb-1">美元价格 (USD/oz)</div>
            <div className="font-mono text-xl font-bold">${price.price.toFixed(2)}</div>
          </div>
          {/* 人民币克价 */}
          <div>
            <div className="text-muted-foreground text-xs mb-1">人民币克价 (CNY/g)</div>
            <div className="font-mono text-xl font-bold text-primary">
              ¥{price.cnyPricePerGram.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 涨跌信息 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 较昨收（近似值） */}
          <div className="p-2.5 rounded-lg bg-muted/30">
            <div className="text-muted-foreground text-xs mb-1">
              较上次 <span className="opacity-50">*</span>
            </div>
            <div
              className={`flex items-center gap-1 font-mono text-sm font-medium ${isUp ? 'text-up' : 'text-down'}`}
            >
              {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {isUp ? '+' : ''}
              {price.change.toFixed(2)} ({isUp ? '+' : ''}
              {safeChangePct.toFixed(2)}%)
            </div>
          </div>
          {/* 较开盘 */}
          <div className="p-2.5 rounded-lg bg-muted/30">
            <div className="text-muted-foreground text-xs mb-1">较开盘</div>
            <div
              className={`flex items-center gap-1 font-mono text-sm font-medium ${isDayUp ? 'text-up' : 'text-down'}`}
            >
              {isDayUp ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {isDayUp ? '+' : ''}
              {price.dayChange.toFixed(2)} ({isDayUp ? '+' : ''}
              {safeDayChangePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* OHLC 数据 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-muted-foreground text-xs">开盘</div>
            <div className="font-mono text-xs mt-0.5">${price.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">最高</div>
            <div className="font-mono text-xs mt-0.5 text-up">${price.high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">最低</div>
            <div className="font-mono text-xs mt-0.5 text-down">${price.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">昨收</div>
            <div className="font-mono text-xs mt-0.5">${price.prevClose.toFixed(2)}</div>
          </div>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-3 pt-3 border-t border-border/50">
          <Clock className="size-3" />
          <span>更新于 {new Date(price.updatedAt).toLocaleTimeString('zh-CN')}</span>
          <span className="ml-auto opacity-50">* 近似值</span>
        </div>
      </CardContent>
    </Card>
  )
}
