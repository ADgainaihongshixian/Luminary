import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 全局错误边界
 * 捕获子组件渲染错误，展示友好错误 UI + 重试按钮
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到错误:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">出错了</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
            {this.state.error?.message || '页面渲染时发生未知错误'}
          </p>
          <Button onClick={this.handleReset} variant="outline">
            <RefreshCw className="size-4 mr-2" />
            重试
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
