import type { FundSearchItem } from '@fund-monitor/shared'
import { useFundSearch } from '@/hooks/useFundSearch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'

interface FundSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (fund: FundSearchItem) => void
}

export function FundSearchDialog({ open, onOpenChange, onSelect }: FundSearchDialogProps) {
  const { keyword, setKeyword, results, isLoading } = useFundSearch()

  const handleSelect = (fund: FundSearchItem) => {
    onSelect(fund)
    setKeyword('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>搜索基金</DialogTitle>
          <DialogDescription>输入基金名称或代码（至少 2 个字符）搜索</DialogDescription>
        </DialogHeader>

        {/* 搜索输入框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="输入基金名称或代码..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* 搜索结果 */}
        <ScrollArea className="h-[300px] mt-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((fund) => (
                <button
                  key={fund.fundCode}
                  onClick={() => handleSelect(fund)}
                  className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground text-xs font-mono">{fund.fundCode}</span>
                    <Badge variant="outline" className="text-xs">
                      {fund.fundType}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm">{fund.fundName}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    最新净值: {fund.nav.toFixed(4)} · {fund.navDate}
                  </div>
                </button>
              ))}
            </div>
          ) : keyword.length >= 2 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Search className="size-8 mb-2 opacity-50" />
              <p>未找到匹配的基金</p>
              <p className="text-xs mt-1">请尝试其他关键词</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Search className="size-8 mb-2 opacity-50" />
              <p>输入关键词开始搜索</p>
              <p className="text-xs mt-1">支持基金名称或代码</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
