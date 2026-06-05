import type { PriceAlert } from '@fund-monitor/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCcw, Trash2, Bell, BellOff, Target } from 'lucide-react'

interface AlertCardProps {
  alert: PriceAlert
  onReset: (alert: PriceAlert) => void
  onDelete: (alert: PriceAlert) => void
}

export function AlertCard({ alert, onReset, onDelete }: AlertCardProps) {
  const isActive = alert.status === 'active'
  const assetTypeLabel = alert.assetType === 'metal' ? '贵金属' : '基金'

  return (
    <Card
      className={`glass-card border-border/50 transition-colors ${isActive ? 'border-l-2 border-l-primary animate-[pulse-glow_2s_ease-in-out_infinite]' : 'opacity-60'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* 左侧信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isActive ? (
                <Bell className="size-4 text-primary" />
              ) : (
                <BellOff className="size-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">{alert.assetName}</span>
              <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                {isActive ? '监控中' : '已触发'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {assetTypeLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <Target className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">目标价</span>
              <span className="font-mono text-sm font-medium">¥{alert.targetPrice.toFixed(2)}</span>
              <span className="text-muted-foreground text-xs">{alert.priceUnit}</span>
            </div>

            <div className="text-muted-foreground text-xs">
              {isActive ? (
                <span>设置于 {new Date(alert.createdAt).toLocaleDateString('zh-CN')}</span>
              ) : (
                <span>
                  触发于{' '}
                  {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString('zh-CN') : '--'}
                </span>
              )}
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex gap-1">
            {!isActive && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onReset(alert)}
                title="重新激活"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(alert)} title="删除">
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
