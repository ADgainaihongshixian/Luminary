import { useState, useEffect } from 'react'
import type { AlertAssetType } from '@fund-monitor/shared'
import { DEFAULT_METAL_SYMBOLS, METALS } from '@fund-monitor/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface AddAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    assetType: AlertAssetType
    assetCode: string
    assetName: string
    targetPrice: number
    priceUnit: string
  }) => void
}

export function AddAlertDialog({ open, onOpenChange, onSave }: AddAlertDialogProps) {
  const [assetType, setAssetType] = useState<AlertAssetType>('metal')
  const [assetCode, setAssetCode] = useState('XAU')
  const [targetPrice, setTargetPrice] = useState('')

  // 重置表单
  useEffect(() => {
    if (open) {
      setAssetType('metal')
      setAssetCode('XAU')
      setTargetPrice('')
    }
  }, [open])

  const handleSubmit = () => {
    const price = Number(targetPrice)
    if (price <= 0) return

    let assetName = ''
    let priceUnit = ''

    if (assetType === 'metal') {
      assetName = METALS[assetCode as keyof typeof METALS]?.name ?? assetCode
      priceUnit = 'CNY/g'
    } else {
      assetName = assetCode
      priceUnit = '元'
    }

    onSave({
      assetType,
      assetCode,
      assetName,
      targetPrice: price,
      priceUnit,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加价格预警</DialogTitle>
          <DialogDescription>当实时价格 ≤ 目标价时，系统将推送通知（仅触发一次）</DialogDescription>
        </DialogHeader>

        {/* 资产类型 */}
        <div className="flex gap-2">
          <Button
            variant={assetType === 'metal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setAssetType('metal')
              setAssetCode('XAU')
            }}
            className="flex-1"
          >
            贵金属
          </Button>
          <Button
            variant={assetType === 'fund' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setAssetType('fund')
              setAssetCode('')
            }}
            className="flex-1"
          >
            基金
          </Button>
        </div>

        {/* 选择品种 */}
        {assetType === 'metal' ? (
          <div className="space-y-1.5">
            <Label>选择品种</Label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_METAL_SYMBOLS.map((symbol) => (
                <Button
                  key={symbol}
                  variant={assetCode === symbol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssetCode(symbol)}
                >
                  {METALS[symbol].name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="fundCode">基金代码</Label>
            <Input
              id="fundCode"
              placeholder="输入 6 位基金代码"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              maxLength={6}
            />
          </div>
        )}

        {/* 目标价 */}
        <div className="space-y-1.5">
          <Label htmlFor="targetPrice">目标价格 ({assetType === 'metal' ? 'CNY/g' : '元'})</Label>
          <Input
            id="targetPrice"
            type="number"
            placeholder="输入目标价格"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            min="0"
            step="0.01"
          />
          <p className="text-muted-foreground text-xs">当实时价格 ≤ 目标价时触发预警通知</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!targetPrice || Number(targetPrice) <= 0}>
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
