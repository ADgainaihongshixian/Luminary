import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  /** 页面标题 */
  title: string
  /** 副标题 */
  subtitle?: string
  /** 返回行为：数字（-1 表示历史返回）或路由路径 */
  backTo?: string | number
  /** 右侧操作区 */
  actions?: React.ReactNode
  /** 标题下方的额外内容（如 Badge） */
  extra?: React.ReactNode
}

/**
 * 通用页面标题组件
 * 包含返回按钮、标题、副标题和可选的操作区
 */
export function PageHeader({ title, subtitle, backTo = -1, actions, extra }: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo)
    } else {
      navigate(backTo)
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gradient">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>}
          {extra && <div className="flex items-center gap-2 mt-1">{extra}</div>}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
