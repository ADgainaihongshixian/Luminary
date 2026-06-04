import { useState, useCallback, useEffect } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported'

/**
 * Web Notifications API 权限管理 hook
 * 处理权限请求、状态检测、发送通知
 */
export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // 初始化：检测当前权限状态
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as NotificationPermission)
  }, [])

  /**
   * 请求通知权限
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      setPermission('denied')
      return 'denied'
    }

    // permission === 'default'，请求权限
    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermission)
    return result as NotificationPermission
  }, [])

  /**
   * 发送系统通知
   * @param title 通知标题
   * @param body 通知正文
   * @param onClick 点击回调
   */
  const sendNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if (Notification.permission !== 'granted') return

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: `luminary-${Date.now()}`, // 防止重复
      requireInteraction: false,
    })

    if (onClick) {
      notification.onclick = () => {
        window.focus()
        onClick()
        notification.close()
      }
    }

    // 5 秒后自动关闭
    setTimeout(() => notification.close(), 5000)
  }, [])

  return {
    permission,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
    sendNotification,
  }
}
