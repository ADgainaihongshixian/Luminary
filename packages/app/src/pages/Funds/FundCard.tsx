import type { PortfolioFund } from '@fund-monitor/shared'
import {
  FUND_TYPE_LABEL,
  calcDailyProfit,
  calcTotalProfit,
  calcTotalProfitRate,
  calcShares,
} from '@fund-monitor/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StaggerItem } from '@/components/motion/FadeIn'
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

interface FundCardProps {
  fund: PortfolioFund
  /** 最新净值 */
  nav?: number
  /** 净值日期 */
  navDate?: string
  /** 实时估值 */
  estimateNav?: number
  /** 估值涨跌幅 (%) */
  estimateRate?: number
  onEdit: (fund: PortfolioFund) => void
  onDelete: (fund: PortfolioFund) => void
  onClick?: (fund: PortfolioFund) => void
}

export function FundCard({
  fund,
  nav,
  navDate,
  estimateNav,
  estimateRate,
  onEdit,
  onDelete,
  onClick,
}: FundCardProps) {
  const isUp = (estimateRate ?? 0) >= 0
  const holdingDisplay =
    fund.holdingMode === 'amount'
      ? `¥${fund.holdingAmount.toLocaleString()}`
      : `${fund.holdingShares.toLocaleString()} 份`

  // 计算当日实时收益
  const dailyProfit =
    estimateRate !== undefined
      ? calcDailyProfit(fund.holdingMode === 'amount' ? fund.holdingAmount : 0, estimateRate)
      : null

  // 计算累计收益（需要成本净值）
  const currentNav = estimateNav ?? nav
  const shares =
    fund.holdingMode === 'shares'
      ? fund.holdingShares
      : fund.costNav && fund.costNav > 0
        ? calcShares(fund.holdingAmount, fund.costNav)
        : null

  const totalProfit =
    currentNav && fund.costNav && shares ? calcTotalProfit(currentNav, fund.costNav, shares) : null

  const totalProfitRate =
    currentNav && fund.costNav ? calcTotalProfitRate(currentNav, fund.costNav) : null

  return (
    <StaggerItem>
      <Card
        className="glass-card border-border/50 hover:border-primary/30 transition-colors group cursor-pointer"
        onClick={() => onClick?.(fund)}
      >
        <CardContent className="p-5">
          {/* 头部：基金名称 + 类型 */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground text-xs font-mono">{fund.fundCode}</span>
                <Badge variant="secondary" className="text-xs">
                  {FUND_TYPE_LABEL[fund.fundType]}
                </Badge>
              </div>
              <h3 className="font-medium text-sm truncate">{fund.fundName}</h3>
            </div>
            {/* 操作按钮 */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(fund)
                }}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(fund)
                }}
              >
                <Trash2 className="size-3 text-destructive" />
              </Button>
            </div>
          </div>

          {/* 最新净值 + 估值 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-muted-foreground text-xs mb-0.5">最新净值</div>
              <div className="font-mono text-sm font-medium">
                {nav !== undefined ? nav.toFixed(4) : '--'}
              </div>
              {navDate && <div className="text-muted-foreground text-xs">{navDate}</div>}
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-xs mb-0.5">实时估值</div>
              <div className="font-mono text-sm font-medium">
                {estimateNav !== undefined ? estimateNav.toFixed(4) : '--'}
              </div>
              {estimateRate !== undefined ? (
                <div
                  className={`flex items-center justify-end gap-1 font-mono text-xs ${isUp ? 'text-up' : 'text-down'}`}
                >
                  {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {isUp ? '+' : ''}
                  {estimateRate.toFixed(2)}%
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">--</span>
              )}
            </div>
          </div>

          {/* 收益信息 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-muted-foreground text-xs mb-0.5">当日收益</div>
              {dailyProfit !== null ? (
                <div
                  className={`font-mono text-sm font-medium ${dailyProfit >= 0 ? 'text-up' : 'text-down'}`}
                >
                  {dailyProfit >= 0 ? '+' : ''}
                  {dailyProfit.toFixed(2)} 元
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">--</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-xs mb-0.5">累计收益</div>
              {totalProfit !== null ? (
                <div
                  className={`font-mono text-sm font-medium ${totalProfit >= 0 ? 'text-up' : 'text-down'}`}
                >
                  {totalProfit >= 0 ? '+' : ''}
                  {totalProfit.toFixed(2)} 元
                  {totalProfitRate !== null && (
                    <span className="text-xs ml-1">
                      ({totalProfitRate >= 0 ? '+' : ''}
                      {totalProfitRate.toFixed(2)}%)
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">
                  {fund.costNav ? '计算中...' : '需填成本净值'}
                </div>
              )}
            </div>
          </div>

          {/* 持仓信息 */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">持仓</span>
            <span className="font-mono text-xs">{holdingDisplay}</span>
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}
