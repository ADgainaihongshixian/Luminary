import { useState, useRef } from 'react'
import { exportData } from '@/utils/export'
import { importData } from '@/utils/import'
import { downloadImportTemplate } from '@/utils/template'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTheme } from '@/hooks/useTheme'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor, THEME_COLORS } from '@/hooks/useThemeColor'
import { useApiConfigStore } from '@/store/useApiConfigStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/PageContainer'
import { PageHeader } from '@/components/PageHeader'
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  Key,
  FileJson,
  ChevronDown,
  HelpCircle,
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

  return (
    <PageContainer size="3xl">
      <PageHeader title="设置" backTo="/" />

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

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <div className="text-sm font-medium">导入模板</div>
              <div className="text-muted-foreground text-xs">
                下载 JSON 模板文件，了解导入数据格式
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadImportTemplate}>
              <FileJson className="size-3.5" />
              下载模板
            </Button>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
              <HelpCircle className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">字段说明</div>
                <div className="text-muted-foreground text-xs">了解模板中各字段的含义和取值</div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
              <div className="p-3 mt-1 rounded-lg bg-muted/20 space-y-4 text-xs">
                {/* 基金持仓 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    基金持仓 (portfolioFunds)
                  </h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-mono">fundCode</span> — 基金代码，如{' '}
                      <code>110011</code>
                    </p>
                    <p>
                      <span className="text-foreground font-mono">fundName</span> — 基金名称
                    </p>
                    <p>
                      <span className="text-foreground font-mono">fundType</span> — 基金类型：
                      <code>stock</code>(股票型) / <code>mix</code>(混合型) / <code>bond</code>
                      (债券型) / <code>monetary</code>(货币型) / <code>index</code>(指数型) /{' '}
                      <code>qdii</code>(QDII) / <code>other</code>(其他)
                    </p>
                    <p>
                      <span className="text-foreground font-mono">holdingMode</span> — 持仓方式：
                      <code>amount</code>(按金额) / <code>shares</code>(按份额)
                    </p>
                    <p>
                      <span className="text-foreground font-mono">holdingAmount</span> —
                      持仓金额（元），按金额持仓时填写
                    </p>
                    <p>
                      <span className="text-foreground font-mono">holdingShares</span> —
                      持有份额，按份额持仓时填写
                    </p>
                    <p>
                      <span className="text-foreground font-mono">costNav</span> —
                      买入成本净值，用于计算累计收益，不填可设为 <code>null</code>
                    </p>
                    <p>
                      <span className="text-foreground font-mono">groupId</span> — 所属分组
                      ID，不分组可设为 <code>null</code>
                    </p>
                    <p>
                      <span className="text-foreground font-mono">remark</span> — 备注
                    </p>
                  </div>
                </div>

                {/* 基金分组 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">基金分组 (fundGroups)</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-mono">id</span> —
                      分组唯一标识，基金持仓中 <code>groupId</code> 引用此值
                    </p>
                    <p>
                      <span className="text-foreground font-mono">name</span> —
                      分组名称，如"稳健型"、"激进型"
                    </p>
                  </div>
                </div>

                {/* 价格预警 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">价格预警 (priceAlerts)</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-mono">assetType</span> — 资产类型：
                      <code>metal</code>(贵金属) / <code>fund</code>(基金)
                    </p>
                    <p>
                      <span className="text-foreground font-mono">assetCode</span> —
                      资产代码：贵金属填 <code>XAU</code>(黄金) / <code>XAG</code>(白银) /{' '}
                      <code>XPT</code>(铂金)；基金填基金代码
                    </p>
                    <p>
                      <span className="text-foreground font-mono">assetName</span> — 显示名称
                    </p>
                    <p>
                      <span className="text-foreground font-mono">targetPrice</span> — 目标价格
                    </p>
                    <p>
                      <span className="text-foreground font-mono">priceUnit</span> — 价格单位，如{' '}
                      <code>USD/oz</code>(美元/盎司) / <code>元</code>
                    </p>
                    <p>
                      <span className="text-foreground font-mono">status</span> — 状态：
                      <code>active</code>(生效中) / <code>triggered</code>(已触发)
                    </p>
                  </div>
                </div>

                {/* 通用字段 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">通用字段</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <span className="text-foreground font-mono">id</span> —
                      唯一标识，可用任意不重复的字符串（建议用 UUID）
                    </p>
                    <p>
                      <span className="text-foreground font-mono">sortOrder</span> —
                      排序序号，数字越小越靠前
                    </p>
                    <p>
                      <span className="text-foreground font-mono">createdAt</span> /{' '}
                      <span className="text-foreground font-mono">updatedAt</span> —
                      创建/更新时间戳（毫秒），可填当前时间
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
    </PageContainer>
  )
}
