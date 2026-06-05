import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PriceAlert } from '@fund-monitor/shared'
import { useAlertStore } from '@/store/useAlertStore'
import { useNotification } from '@/hooks/useNotification'
import { AlertCard } from './AlertCard'
import { AddAlertDialog } from './AddAlertDialog'
import { Button } from '@/components/ui/button'
import { Plus, Bell, BellOff, ShieldAlert, ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'

export function AlertList() {
  const navigate = useNavigate()
  const { alerts, isLoading, loadAlerts, addAlert, deleteAlert, resetAlert } = useAlertStore()
  const { isSupported, isGranted, isDenied, requestPermission } = useNotification()
  const [addOpen, setAddOpen] = useState(false)
  const [showPermissionBanner, setShowPermissionBanner] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // 点击添加时检查权限
  const handleAddClick = async () => {
    if (!isGranted && isSupported) {
      const result = await requestPermission()
      if (result === 'denied') return
    }
    setAddOpen(true)
  }

  const handleDelete = async (alert: PriceAlert) => {
    if (window.confirm(`确定要删除「${alert.assetName}」的预警吗？`)) {
      await deleteAlert(alert.id)
    }
  }

  const activeAlerts = alerts.filter((a) => a.status === 'active')
  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered')

  return (
    <PageContainer>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">价格预警</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              设置目标价格，首次触达时推送系统通知
            </p>
          </div>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="size-4" />
          添加预警
        </Button>
      </div>

      {/* 通知权限提示 */}
      {isSupported && !isGranted && showPermissionBanner && (
        <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
          <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isDenied ? '通知权限已被拒绝' : '需要开启通知权限'}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {isDenied
                ? '请在浏览器设置中手动开启通知权限，否则预警无法推送'
                : '开启通知权限后，价格预警触发时将收到系统通知'}
            </p>
            {!isDenied && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={async () => await requestPermission()}
              >
                <Bell className="size-3.5" />
                开启通知
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => setShowPermissionBanner(false)}>
            ✕
          </Button>
        </div>
      )}

      {/* 微信环境提示 */}
      {!isSupported && (
        <div className="mb-4 p-4 rounded-lg bg-info/10 border border-info/30 flex items-start gap-3">
          <BellOff className="size-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">当前环境不支持系统通知</p>
            <p className="text-muted-foreground text-xs mt-1">
              微信内置浏览器不支持 Web Notifications API，预警将以应用内提示方式展示
            </p>
          </div>
        </div>
      )}

      {/* 预警列表 */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="animate-pulse">加载中...</div>
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-6">
          {/* 监控中 */}
          {activeAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Bell className="size-4" />
                监控中 ({activeAlerts.length})
              </h2>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onReset={(a) => resetAlert(a.id)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 已触发 */}
          {triggeredAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BellOff className="size-4" />
                已触发 ({triggeredAlerts.length})
              </h2>
              <div className="space-y-2">
                {triggeredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onReset={(a) => resetAlert(a.id)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 空态引导 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">暂无预警规则</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            为贵金属或基金设置目标价格，当价格达到目标位时第一时间收到通知
          </p>
          <Button onClick={handleAddClick} size="lg">
            <Plus className="size-4" />
            添加第一条预警
          </Button>
        </div>
      )}

      {/* 添加弹窗 */}
      <AddAlertDialog open={addOpen} onOpenChange={setAddOpen} onSave={addAlert} />
    </PageContainer>
  )
}
