import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FundSearchItem, PortfolioFund } from '@fund-monitor/shared'
import { useFundStore } from '@/store/useFundStore'
import { useGroupStore } from '@/store/useGroupStore'
import { useFundEstimates } from '@/hooks/useFundEstimates'
import { FundCard } from './FundCard'
import { FundSearchDialog } from './FundSearchDialog'
import { AddFundDialog } from './AddFundDialog'
import { StaggerContainer } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, TrendingUp, FolderPlus, X, ArrowLeft, RefreshCw } from 'lucide-react'

export function FundList() {
  const navigate = useNavigate()
  const { funds, isLoading, loadFunds, addFund, updateFund, deleteFund } = useFundStore()
  const { groups, loadGroups, addGroup, deleteGroup } = useGroupStore()

  // 批量获取基金估值
  const { data: fundEstimates, refreshAll, isLoading: isEstimatesLoading } = useFundEstimates(funds)

  // 搜索弹窗状态
  const [searchOpen, setSearchOpen] = useState(false)
  // 添加/编辑弹窗状态
  const [addOpen, setAddOpen] = useState(false)
  const [selectedFundItem, setSelectedFundItem] = useState<FundSearchItem | null>(null)
  const [editingFund, setEditingFund] = useState<PortfolioFund | null>(null)
  // 分组筛选
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  // 新建分组
  const [newGroupName, setNewGroupName] = useState('')
  const [showGroupInput, setShowGroupInput] = useState(false)

  // 页面加载时从 IndexedDB 读取数据
  useEffect(() => {
    loadFunds()
    loadGroups()
  }, [loadFunds, loadGroups])

  // 搜索选中基金 → 打开添加弹窗
  const handleSearchSelect = (fund: FundSearchItem) => {
    setSelectedFundItem(fund)
    setEditingFund(null)
    setAddOpen(true)
  }

  // 编辑基金
  const handleEdit = (fund: PortfolioFund) => {
    setEditingFund(fund)
    setSelectedFundItem(null)
    setAddOpen(true)
  }

  // 删除基金
  const handleDelete = async (fund: PortfolioFund) => {
    if (window.confirm(`确定要删除「${fund.fundName}」吗？`)) {
      await deleteFund(fund.id)
    }
  }

  // 保存（新增或编辑）
  const handleSave = async (data: {
    fundCode: string
    fundName: string
    fundType: import('@fund-monitor/shared').FundType
    holdingMode: import('@fund-monitor/shared').HoldingMode
    holdingAmount: number
    holdingShares: number
    costNav: number | null
    remark: string
  }) => {
    if (editingFund) {
      await updateFund(editingFund.id, data)
    } else {
      await addFund({ ...data, groupId: selectedGroupId })
    }
  }

  // 添加分组
  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      await addGroup(newGroupName.trim())
      setNewGroupName('')
      setShowGroupInput(false)
    }
  }

  // 删除分组
  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('确定要删除此分组吗？分组内的基金不会被删除。')) {
      await deleteGroup(id)
      if (selectedGroupId === id) setSelectedGroupId(null)
    }
  }

  // 按分组筛选
  const filteredEstimates =
    selectedGroupId === null
      ? fundEstimates
      : selectedGroupId === '__ungrouped'
        ? fundEstimates.filter((fe) => !fe.fund.groupId)
        : fundEstimates.filter((fe) => fe.fund.groupId === selectedGroupId)

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">我的基金</h1>
            <p className="text-muted-foreground text-sm mt-1">管理持仓基金，实时查看估值与收益</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadFunds()
              refreshAll()
            }}
            disabled={isLoading || isEstimatesLoading}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading || isEstimatesLoading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
          <Button onClick={() => setSearchOpen(true)}>
            <Plus className="size-4" />
            添加基金
          </Button>
        </div>
      </div>

      {/* 分组筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge
          variant={selectedGroupId === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedGroupId(null)}
        >
          全部 ({funds.length})
        </Badge>
        {groups.map((group) => {
          const count = funds.filter((f) => f.groupId === group.id).length
          return (
            <Badge
              key={group.id}
              variant={selectedGroupId === group.id ? 'default' : 'outline'}
              className="cursor-pointer group"
              onClick={() => setSelectedGroupId(group.id)}
            >
              {group.name} ({count})
              <X
                className="size-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteGroup(group.id)
                }}
              />
            </Badge>
          )
        })}
        {/* 未分组 */}
        {funds.some((f) => !f.groupId) && (
          <Badge
            variant={selectedGroupId === '__ungrouped' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedGroupId('__ungrouped')}
          >
            未分组 ({funds.filter((f) => !f.groupId).length})
          </Badge>
        )}
        {/* 添加分组 */}
        {showGroupInput ? (
          <div className="flex items-center gap-1">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="分组名称"
              className="h-6 w-24 text-xs"
              maxLength={10}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
              autoFocus
            />
            <Button size="xs" onClick={handleAddGroup}>
              确定
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setShowGroupInput(false)}>
              取消
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => setShowGroupInput(true)}
          >
            <FolderPlus className="size-3 mr-1" />
            新建分组
          </Badge>
        )}
      </div>

      {/* 基金列表 */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="animate-pulse">加载中...</div>
        </div>
      ) : filteredEstimates.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEstimates.map(({ fund, estimate }) => (
            <FundCard
              key={fund.id}
              fund={fund}
              nav={estimate?.nav}
              navDate={estimate?.navDate}
              estimateNav={estimate?.estimateNav}
              estimateRate={estimate?.estimateRate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(f) => navigate(`/funds/${f.fundCode}`)}
            />
          ))}
        </StaggerContainer>
      ) : (
        /* 空态引导 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <TrendingUp className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {selectedGroupId !== null ? '该分组暂无基金' : '暂无持仓基金'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            {selectedGroupId !== null
              ? '切换到其他分组或添加新基金'
              : '点击下方按钮搜索并添加你持有的基金，实时跟踪估值与收益'}
          </p>
          <Button onClick={() => setSearchOpen(true)} size="lg">
            <Search className="size-4" />
            搜索添加基金
          </Button>
        </div>
      )}

      {/* 搜索弹窗 */}
      <FundSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSearchSelect}
      />

      {/* 添加/编辑弹窗 */}
      <AddFundDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        fundItem={selectedFundItem}
        editingFund={editingFund}
        onSave={handleSave}
      />
    </div>
  )
}
