import { useRef, useEffect } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { FundNavHistory } from '@fund-monitor/shared'

echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer])

interface FundNavChartProps {
  data: FundNavHistory[]
  height?: number
}

export function FundNavChart({ data, height = 300 }: FundNavChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current, 'dark')
    instanceRef.current = chart

    const dates = data.map((d) => d.date)
    const navs = data.map((d) => d.nav)

    chart.setOption({
      backgroundColor: 'transparent',
      grid: {
        top: 20,
        right: 16,
        bottom: 40,
        left: 60,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(20, 23, 38, 0.95)',
        borderColor: '#1E2240',
        textStyle: { color: '#E2E8F0', fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0]
          if (!p) return ''
          return `<div style="font-size:12px">
            <div style="color:#94A3B8">${p.name}</div>
            <div style="font-size:14px;font-weight:600;margin-top:4px">净值: ${p.value.toFixed(4)}</div>
          </div>`
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#1E2240' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1E2240', type: 'dashed' } },
        scale: true,
      },
      series: [
        {
          type: 'line',
          data: navs,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: '#7C3AED',
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(124, 58, 237, 0.3)' },
              { offset: 1, color: 'rgba(124, 58, 237, 0.02)' },
            ]),
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut' as const,
          animationDelay: (idx: number) => idx * 5,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
      ],
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data])

  return <div ref={chartRef} style={{ width: '100%', height }} />
}
