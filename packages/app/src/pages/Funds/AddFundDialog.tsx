import { useState, useEffect } from 'react'
import type { FundSearchItem, PortfolioFund, HoldingMode, FundType } from '@fund-monitor/shared'
import { FUND_TYPE_LABEL } from '@fund-monitor/shared'
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
import { Badge } from '@/components/ui/badge'

interface AddFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 搜索选中的基金（新建时） */
  fundItem?: FundSearchItem | null
  /** 编辑时传入已有持仓 */
  editingFund?: PortfolioFund | null
  onSave: (data: {
    fundCode: string
    fundName: string
    fundType: FundType
    holdingMode: HoldingMode
    holdingAmount: number
    holdingShares: number
    costNav: number | null
    remark: string
  }) => void
}

/** 将搜索结果的 fundType 字符串映射为 FundType 枚举 */
function mapFundType(type: string): FundType {
  const map: Record<string, FundType> = {
    股票型: 'stock',
    混合型: 'mix',
    债券型: 'bond',
    货币型: 'monetary',
    指数型: 'index',
    QDII: 'qdii',
  }
  return map[type] ?? 'other'
}

export function AddFundDialog({
  open,
  onOpenChange,
  fundItem,
  editingFund,
  onSave,
}: AddFundDialogProps) {
  const isEditing = !!editingFund

  const [holdingMode, setHoldingMode] = useState<HoldingMode>('amount')
  const [holdingAmount, setHoldingAmount] = useState('')
  const [holdingShares, setHoldingShares] = useState('')
  const [costNav, setCostNav] = useState('')
  const [remark, setRemark] = useState('')

  // 编辑模式：预填数据
  useEffect(() => {
    if (editingFund) {
      setHoldingMode(editingFund.holdingMode)
      setHoldingAmount(
        editingFund.holdingMode === 'amount' ? String(editingFund.holdingAmount) : ''
      )
      setHoldingShares(
        editingFund.holdingMode === 'shares' ? String(editingFund.holdingShares) : ''
      )
      setCostNav(editingFund.costNav !== null ? String(editingFund.costNav) : '')
      setRemark(editingFund.remark)
    } else {
      // 新建模式：重置
      setHoldingMode('amount')
      setHoldingAmount('')
      setHoldingShares('')
      setCostNav('')
      setRemark('')
    }
  }, [editingFund, open])

  const handleSubmit = () => {
    const code = editingFund?.fundCode ?? fundItem?.fundCode ?? ''
    const name = editingFund?.fundName ?? fundItem?.fundName ?? ''
    const type = editingFund?.fundType ?? mapFundType(fundItem?.fundType ?? 'other')

    onSave({
      fundCode: code,
      fundName: name,
      fundType: type,
      holdingMode,
      holdingAmount: holdingMode === 'amount' ? Number(holdingAmount) || 0 : 0,
      holdingShares: holdingMode === 'shares' ? Number(holdingShares) || 0 : 0,
      costNav: costNav ? Number(costNav) : null,
      remark,
    })

    onOpenChange(false)
  }

  const fundCode = editingFund?.fundCode ?? fundItem?.fundCode ?? ''
  const fundName = editingFund?.fundName ?? fundItem?.fundName ?? ''
  const fundType = editingFund?.fundType ?? mapFundType(fundItem?.fundType ?? 'other')

  const isValid = holdingMode === 'amount' ? Number(holdingAmount) > 0 : Number(holdingShares) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑持仓' : '添加基金'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改持仓信息' : '填写持仓信息后保存到本地'}
          </DialogDescription>
        </DialogHeader>

        {/* 基金信息 */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground text-xs font-mono">{fundCode}</span>
            <Badge variant="secondary" className="text-xs">
              {FUND_TYPE_LABEL[fundType]}
            </Badge>
          </div>
          <div className="font-medium text-sm">{fundName}</div>
        </div>

        {/* 持仓模式 */}
        <div className="flex gap-2">
          <Button
            variant={holdingMode === 'amount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHoldingMode('amount')}
            className="flex-1"
          >
            按金额
          </Button>
          <Button
            variant={holdingMode === 'shares' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHoldingMode('shares')}
            className="flex-1"
          >
            按份额
          </Button>
        </div>

        {/* 持仓输入 */}
        <div className="space-y-3">
          {holdingMode === 'amount' ? (
            <div className="space-y-1.5">
              <Label htmlFor="amount">买入金额（元）</Label>
              <Input
                id="amount"
                type="number"
                placeholder="请输入买入金额"
                value={holdingAmount}
                onChange={(e) => setHoldingAmount(e.target.value)}
                min="0"
                step="100"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="shares">持有份额</Label>
              <Input
                id="shares"
                type="number"
                placeholder="请输入持有份额"
                value={holdingShares}
                onChange={(e) => setHoldingShares(e.target.value)}
                min="0"
                step="100"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="costNav">买入成本净值（可选）</Label>
            <Input
              id="costNav"
              type="number"
              placeholder="用于计算累计收益"
              value={costNav}
              onChange={(e) => setCostNav(e.target.value)}
              min="0"
              step="0.0001"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="remark">备注（可选）</Label>
            <Input
              id="remark"
              placeholder="如：定投、长线持有..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isEditing ? '保存修改' : '确认添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
