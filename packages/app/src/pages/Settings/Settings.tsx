import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportData } from '@/utils/export'
import { importData } from '@/utils/import'
import { useTheme } from '@/hooks/useTheme'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor, THEME_COLORS } from '@/hooks/useThemeColor'
import { useApiConfigStore } from '@/store/useApiConfigStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react'

const THEME_OPTIONS = [
  { value: 'dark' as const, label: '暗色', icon: Moon },
  { value: 'light' as const, label: '亮色', icon: Sun },
  { value: 'system' as const, label: '跟随系统', icon: Monitor },
]

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { colorScheme, setColorScheme } = useColorScheme()
  const { themeColor, setThemeColor } = useThemeColor()
  const { twelveDataKey, setTwelveDataKey } = useApiConfigStore()
  const [apiKeyInput, setApiKeyInput] = useState(twelveDataKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      await exportData()
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = window.confirm(
      '导入将覆盖当前所有数据（基金持仓、预警、设置），此操作不可撤销。确定要继续吗？'
    )
    if (!confirmed) {
      e.target.value = ''
      return
    }

    try {
      await importData(file)
      setImportStatus('success')
      setImportError('')
      setTimeout(() => setImportStatus('idle'), 3000)
    } catch (error) {
      setImportStatus('error')
      setImportError(error instanceof Error ? error.message : '导入失败')
    }

    e.target.value = ''
  }

  const handleSaveApiKey = async () => {
    await setTwelveDataKey(apiKeyInput.trim())
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      {/* 主题设置 */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-sm font-medium mb-4">外观</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={theme === opt.value ? 'default' : 'outline'}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
              onClick={() => setTheme(opt.value)}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 主题配色 */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-sm font-medium mb-2">主题配色</h2>
        <p className="text-muted-foreground text-xs mb-3">选择你喜欢的强调色风格</p>
        <div className="grid grid-cols-5 gap-2">
          {THEME_COLORS.map((opt) => (
            <button
              key={opt.value}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
                themeColor === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setThemeColor(opt.value)}
            >
              <div
                className="size-6 rounded-full border-2"
                style={{
                  backgroundColor: opt.color,
                  borderColor: themeColor === opt.value ? 'var(--foreground)' : 'transparent',
                }}
              />
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 涨跌色设置 */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-sm font-medium mb-2">涨跌色偏好</h2>
        <p className="text-muted-foreground text-xs mb-3">选择涨跌颜色显示风格</p>
        <div className="flex gap-2">
          <Badge
            variant={colorScheme === 'green-up' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setColorScheme('green-up')}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-up mr-1.5" />
            涨绿跌红（A 股）
          </Badge>
          <Badge
            variant={colorScheme === 'red-up' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setColorScheme('red-up')}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-down mr-1.5" />
            涨红跌绿（港美股）
          </Badge>
        </div>
      </div>

      {/* API 配置 */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Key className="size-4" />
          API 配置
        </h2>
        <p className="text-muted-foreground text-xs mb-4">配置第三方 API Key 以启用历史数据功能</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Twelve Data API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="输入你的 API Key"
                  className="pr-9 font-mono text-sm"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button size="sm" onClick={handleSaveApiKey}>
                保存
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <a
                href="https://twelvedata.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline"
              >
                免费注册获取 Key（800次/天）→
              </a>
              {apiKeySaved && (
                <span className="text-xs text-up flex items-center gap-1">
                  <CheckCircle className="size-3" />
                  已保存
                </span>
              )}
            </div>
          </div>

          {twelveDataKey && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-up/10 border border-up/20 text-xs text-up">
              <CheckCircle className="size-3.5 shrink-0" />
              <span>API Key 已配置 · 历史数据功能可用</span>
            </div>
          )}
          {!twelveDataKey && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>未配置 API Key · 贵金属历史数据不可用</span>
            </div>
          )}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-sm font-medium mb-4">数据管理</h2>
        <p className="text-muted-foreground text-xs mb-4">
          所有数据存储在浏览器本地（IndexedDB），建议定期导出备份
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <div className="text-sm font-medium">导出数据</div>
              <div className="text-muted-foreground text-xs">将所有数据导出为 JSON 文件</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-3.5" />
              导出
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <div className="text-sm font-medium">导入数据</div>
              <div className="text-muted-foreground text-xs">从 JSON 备份文件恢复数据</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="size-3.5" />
              导入
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {importStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-up/10 border border-up/30 text-up text-sm">
              <CheckCircle className="size-4" />
              数据导入成功！
            </div>
          )}
          {importStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="size-4" />
              {importError}
            </div>
          )}
        </div>
      </div>

      {/* 关于 */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-medium mb-4">关于</h2>
        <div className="space-y-2 text-muted-foreground text-xs">
          <p>「流光」— 基金 & 贵金属实时监控平台</p>
          <p>版本: v0.3.0 (Phase 3)</p>
          <p>
            技术栈: React 18 + Vite 5 + Tailwind CSS v4 + shadcn/ui + ECharts + Framer Motion +
            Zustand + Dexie.js
          </p>
        </div>
      </div>
    </div>
  )
}
