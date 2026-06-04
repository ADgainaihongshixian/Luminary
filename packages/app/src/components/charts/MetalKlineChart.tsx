import { useRef, useEffect } from 'react'
import * as echarts from 'echarts/core'
import { CandlestickChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { MetalOHLC } from '@fund-monitor/shared'

echarts.use([
  CandlestickChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
])

interface MetalKlineChartProps {
  data: MetalOHLC[]
  height?: number
  /** 传入涨跌色，变化时图表会重新渲染 */
  colorScheme?: string
}

/** 从 CSS 变量读取当前涨跌色 */
function getUpDownColors() {
  const style = getComputedStyle(document.documentElement)
  const up = style.getPropertyValue('--color-up').trim() || '#22C55E'
  const down = style.getPropertyValue('--color-down').trim() || '#EF4444'
  return { up, down }
}

export function MetalKlineChart({ data, height = 350, colorScheme }: MetalKlineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current, 'dark')
    instanceRef.current = chart

    const { up, down } = getUpDownColors()

    const dates = data.map((d) => d.date)
    const ohlc = data.map((d) => [d.open, d.close, d.low, d.high])

    // 日期索引映射，用于 tooltip 从原始数据取值
    const dateIndexMap = new Map(dates.map((d, i) => [d, i]))
    const ma5: (number | null)[] = []
    const ma20: (number | null)[] = []

    // 计算 MA5 和 MA20
    for (let i = 0; i < data.length; i++) {
      if (i >= 4) {
        const sum5 = data.slice(i - 4, i + 1).reduce((s, d) => s + d.close, 0)
        ma5.push(+(sum5 / 5).toFixed(2))
      } else {
        ma5.push(null)
      }
      if (i >= 19) {
        const sum20 = data.slice(i - 19, i + 1).reduce((s, d) => s + d.close, 0)
        ma20.push(+(sum20 / 20).toFixed(2))
      } else {
        ma20.push(null)
      }
    }

    chart.setOption({
      backgroundColor: 'transparent',
      grid: [{ top: 20, right: 16, bottom: 80, left: 60 }],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(20, 23, 38, 0.95)',
        borderColor: '#1E2240',
        textStyle: { color: '#E2E8F0', fontSize: 12 },
        formatter: (params: { seriesName: string; data: number[]; name: string }[]) => {
          const candle = params.find((p) => p.seriesName === 'K线')
          if (!candle) return ''
          // 从原始数据取值，避免 ECharts 内部重排导致字段错位
          const idx = dateIndexMap.get(candle.name)
          const item = idx !== undefined ? data[idx] : null
          const open = item?.open ?? candle.data[0]
          const close = item?.close ?? candle.data[1]
          const low = item?.low ?? candle.data[2]
          const high = item?.high ?? candle.data[3]
          const isUp = close >= open
          const color = isUp ? up : down
          return `<div style="font-size:12px">
            <div style="color:#94A3B8;margin-bottom:4px">${candle.name}</div>
            <div>开盘: <span style="color:${color}">$${open.toFixed(2)}</span></div>
            <div>收盘: <span style="color:${color}">$${close.toFixed(2)}</span></div>
            <div>最低: <span style="color:${down}">$${low.toFixed(2)}</span></div>
            <div>最高: <span style="color:${up}">$${high.toFixed(2)}</span></div>
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
          name: 'K线',
          type: 'candlestick',
          data: ohlc,
          itemStyle: {
            color: up, // 涨 - 填充
            color0: down, // 跌 - 填充
            borderColor: up, // 涨 - 边框
            borderColor0: down, // 跌 - 边框
          },
        },
        {
          name: 'MA5',
          type: 'line',
          data: ma5,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#F59E0B', width: 1 },
        },
        {
          name: 'MA20',
          type: 'line',
          data: ma20,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#06B6D4', width: 1 },
        },
      ],
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          borderColor: '#1E2240',
          backgroundColor: '#0D0F1A',
          fillerColor: 'rgba(124, 58, 237, 0.15)',
          handleStyle: { color: '#7C3AED' },
          textStyle: { color: '#64748B', fontSize: 11 },
        },
      ],
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data, colorScheme])

  return <div ref={chartRef} style={{ width: '100%', height }} />
}
