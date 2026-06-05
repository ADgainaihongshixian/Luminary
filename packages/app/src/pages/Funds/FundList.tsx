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
import { Plus, Search, TrendingUp, FolderPlus, X, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'

export function FundList() {
  const navigate = useNavigate()
  const { funds, isLoading, loadFunds, addFund, updateFund, deleteFund } = useFundStore()
  const { groups, loadGroups, addGroup, deleteGroup } = useGroupStore()

  // 批量获取基金估值
  const {
    data: fundEstimates,
    refreshAll,
    isLoading: isEstimatesLoading,
    isError: isEstimatesError,
  } = useFundEstimates(funds)

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
    <PageContainer>
      {/* 页面标题 */}
      <PageHeader
        title="我的基金"
        subtitle="管理持仓基金，实时查看估值与收益"
        backTo="/"
        actions={
          <>
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
          </>
        }
      />

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

      {/* 估值 API 错误提示 */}
      {isEstimatesError && funds.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-between">
          <span className="text-destructive text-sm">
            ⚠️ 实时估值获取失败，显示的是本地缓存数据
          </span>
          <Button variant="ghost" size="sm" onClick={() => refreshAll()}>
            <RefreshCw className="size-3.5 mr-1" />
            重试
          </Button>
        </div>
      )}

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
        <EmptyState
          icon={TrendingUp}
          title={selectedGroupId !== null ? '该分组暂无基金' : '暂无持仓基金'}
          description={
            selectedGroupId !== null
              ? '切换到其他分组或添加新基金'
              : '点击下方按钮搜索并添加你持有的基金，实时跟踪估值与收益'
          }
          action={{
            label: '搜索添加基金',
            onClick: () => setSearchOpen(true),
            icon: Search,
          }}
        />
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
    </PageContainer>
  )
}
