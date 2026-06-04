import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/useAlertStore'
import { useMetalStore } from '@/store/useMetalStore'
import { useNotification } from '@/hooks/useNotification'
import { getFundEstimate } from '@fund-monitor/data-service'
import { METALS } from '@fund-monitor/shared'

/**
 * 预警检测 hook
 * 监听贵金属价格和基金净值变化，当价格 ≤ 目标价时触发通知
 * 规则：实时价格 ≤ 用户设置的目标价 → 触发（仅一次）
 */
export function useAlertChecker() {
  const alerts = useAlertStore((s) => s.alerts)
  const triggerAlert = useAlertStore((s) => s.triggerAlert)
  const prices = useMetalStore((s) => s.prices)
  const { sendNotification, isGranted } = useNotification()

  // 已触发的 ID 集合（防止同一会话内重复触发）
  const triggeredRef = useRef<Set<string>>(new Set())

  // 贵金属预警检测
  useEffect(() => {
    if (!isGranted) return

    const activeMetalAlerts = alerts.filter((a) => a.assetType === 'metal' && a.status === 'active')

    for (const alert of activeMetalAlerts) {
      if (triggeredRef.current.has(alert.id)) continue

      const price = prices[alert.assetCode as keyof typeof prices]
      if (!price) continue

      const currentPrice = price.cnyPricePerGram
      if (currentPrice <= alert.targetPrice) {
        triggeredRef.current.add(alert.id)

        const metalName = METALS[alert.assetCode as keyof typeof METALS]?.name ?? alert.assetName
        sendNotification(
          '🔔 「流光」价格预警触发',
          `${metalName}现价 ¥${currentPrice.toFixed(2)}/g，已达到您设定的目标价 ¥${alert.targetPrice.toFixed(2)}/g`,
          () => {
            window.location.href = '/alerts'
          }
        )

        triggerAlert(alert.id)
      }
    }
  }, [alerts, prices, isGranted, sendNotification, triggerAlert])

  // 基金预警检测（定期检查）
  useEffect(() => {
    if (!isGranted) return

    const activeFundAlerts = alerts.filter((a) => a.assetType === 'fund' && a.status === 'active')
    if (activeFundAlerts.length === 0) return

    const checkFundAlerts = async () => {
      for (const alert of activeFundAlerts) {
        if (triggeredRef.current.has(alert.id)) continue

        try {
          const estimate = await getFundEstimate(alert.assetCode)
          if (!estimate) continue

          const currentNav = estimate.estimateNav
          if (currentNav <= alert.targetPrice) {
            triggeredRef.current.add(alert.id)

            sendNotification(
              '🔔 「流光」基金预警触发',
              `${alert.assetName}估值 ${currentNav.toFixed(4)}，已达到您设定的目标价 ${alert.targetPrice.toFixed(4)}`,
              () => {
                window.location.href = '/alerts'
              }
            )

            triggerAlert(alert.id)
          }
        } catch {
          // 静默失败
        }
      }
    }

    // 立即检查一次
    checkFundAlerts()

    // 每 15 分钟检查一次（与基金估值刷新同步）
    const timer = setInterval(checkFundAlerts, 1000 * 60 * 15)
    return () => clearInterval(timer)
  }, [alerts, isGranted, sendNotification, triggerAlert])
}
