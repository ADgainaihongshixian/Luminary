import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { FundNavHistory } from '@fund-monitor/shared'
import { FUND_TYPE_LABEL } from '@fund-monitor/shared'
import { getFundNavHistory, getFundEstimate } from '@fund-monitor/data-service'
import { FundNavChart } from '@/components/charts/FundNavChart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'

const TIME_RANGES = [
  { label: '近1月', value: '1M' },
  { label: '近3月', value: '3M' },
  { label: '近6月', value: '6M' },
  { label: '近1年', value: '1Y' },
  { label: '近3年', value: '3Y' },
  { label: '成立以来', value: 'ALL' },
]

export function FundDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [range, setRange] = useState('1M')
  const [navData, setNavData] = useState<FundNavHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fundInfo, setFundInfo] = useState<{ name: string; type: string } | null>(null)

  // 加载历史净值
  useEffect(() => {
    if (!code) return
    setIsLoading(true)

    // 获取基金信息
    getFundEstimate(code).then((est) => {
      if (est) {
        setFundInfo({ name: est.fundName, type: est.fundType })
      }
    })

    // 获取历史净值
    const pageSize = range === '1M' ? 22 : range === '3M' ? 66 : range === '6M' ? 132 : 250
    getFundNavHistory(code, 1, pageSize).then((data) => {
      setNavData(data)
      setIsLoading(false)
    })
  }, [code, range])

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{fundInfo?.name ?? code ?? '基金详情'}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-muted-foreground text-xs font-mono">{code}</span>
            {fundInfo && (
              <Badge variant="secondary" className="text-xs">
                {FUND_TYPE_LABEL[fundInfo.type as keyof typeof FUND_TYPE_LABEL] ?? fundInfo.type}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 时间范围切换 */}
      <Tabs value={range} onValueChange={setRange} className="mb-4">
        <TabsList>
          {TIME_RANGES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 净值走势图 */}
      <div className="glass-card p-4 mb-6">
        {isLoading ? (
          <Skeleton className="w-full h-[300px] rounded-lg" />
        ) : navData.length > 0 ? (
          <FundNavChart data={navData} height={300} />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            暂无历史净值数据
          </div>
        )}
      </div>

      {/* 历史净值列表 */}
      <div className="glass-card p-4">
        <h2 className="text-sm font-medium mb-3">近期净值</h2>
        {navData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead className="text-right">单位净值</TableHead>
                <TableHead className="text-right">累计净值</TableHead>
                <TableHead className="text-right">日增长率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {navData.slice(0, 20).map((nav) => (
                <TableRow key={nav.date}>
                  <TableCell className="font-mono text-xs">{nav.date}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {nav.nav.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {nav.accNav.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`flex items-center justify-end gap-1 font-mono text-sm ${nav.dayGrowth >= 0 ? 'text-up' : 'text-down'}`}
                    >
                      {nav.dayGrowth >= 0 ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      {nav.dayGrowth >= 0 ? '+' : ''}
                      {nav.dayGrowth.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">暂无数据</div>
        )}
      </div>
    </div>
  )
}
