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
  /** 图表类型：candlestick=K线图，line=分时折线图 */
  chartType?: 'candlestick' | 'line'
}

/** 从 CSS 变量读取当前涨跌色 */
function getUpDownColors() {
  const style = getComputedStyle(document.documentElement)
  const up = style.getPropertyValue('--color-up').trim() || '#22C55E'
  const down = style.getPropertyValue('--color-down').trim() || '#EF4444'
  return { up, down }
}

/** hex 颜色转 rgba */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 分时折线图配置
 */
function buildLineOption(data: MetalOHLC[], up: string, down: string) {
  const dates = data.map((d) => {
    // datetime 格式：2024-01-15 09:05:00，提取时间部分（HH:mm）
    const parts = d.date.split(' ')
    if (parts.length > 1) {
      const time = parts[1]
      // 去掉秒，只保留 HH:mm
      const segments = time.split(':')
      return segments.length >= 2 ? `${segments[0]}:${segments[1]}` : time
    }
    return d.date
  })
  const closes = data.map((d) => d.close)

  // 以第一个收盘价作为参考线
  const refPrice = closes[0] ?? 0
  const lastPrice = closes[closes.length - 1] ?? refPrice
  const isUp = lastPrice >= refPrice
  const lineColor = isUp ? up : down

  return {
    backgroundColor: 'transparent',
    grid: [{ top: 20, right: 16, bottom: 60, left: 60 }],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(20, 23, 38, 0.95)',
      borderColor: '#1E2240',
      textStyle: { color: '#E2E8F0', fontSize: 12 },
      formatter: (
        params: { seriesName: string; data: number; name: string; dataIndex: number }[]
      ) => {
        const point = params.find((p) => p.seriesName === '价格')
        if (!point) return ''
        const idx = point.dataIndex
        const item = data[idx]
        const priceChange = point.data - refPrice
        const pctChange = refPrice > 0 ? ((priceChange / refPrice) * 100).toFixed(2) : '0.00'
        const changeColor = priceChange >= 0 ? up : down
        const sign = priceChange >= 0 ? '+' : ''
        return `<div style="font-size:12px">
          <div style="color:#94A3B8;margin-bottom:4px">${item.date}</div>
          <div>价格: <span style="color:${lineColor}">$${point.data.toFixed(2)}</span></div>
          <div>涨跌: <span style="color:${changeColor}">${sign}$${priceChange.toFixed(2)} (${sign}${pctChange}%)</span></div>
          <div>最高: <span style="color:${up}">$${item.high.toFixed(2)}</span></div>
          <div>最低: <span style="color:${down}">$${item.low.toFixed(2)}</span></div>
        </div>`
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#1E2240' } },
      axisLabel: { color: '#64748B', fontSize: 11 },
      axisTick: { show: false },
      boundaryGap: false,
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
        name: '价格',
        type: 'line',
        data: closes,
        smooth: false,
        showSymbol: false,
        lineStyle: { color: lineColor, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(lineColor, 0.25) },
            { offset: 1, color: 'rgba(0, 0, 0, 0)' },
          ]),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#64748B', type: 'dashed', width: 1 },
          data: [{ yAxis: refPrice }],
          label: {
            show: true,
            position: 'insideEndTop',
            formatter: `$${refPrice.toFixed(2)}`,
            color: '#64748B',
            fontSize: 10,
          },
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut' as const,
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
  }
}

/**
 * K线图配置
 */
function buildCandlestickOption(data: MetalOHLC[], up: string, down: string) {
  const useSmooth = data.length >= 20
  const dates = data.map((d) => d.date)
  const ohlc = data.map((d) => [d.open, d.close, d.low, d.high])
  const dateIndexMap = new Map(dates.map((d, i) => [d, i]))
  const ma5: (number | null)[] = []
  const ma20: (number | null)[] = []

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

  return {
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
          color: up,
          color0: down,
          borderColor: up,
          borderColor0: down,
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut' as const,
        animationDelay: (idx: number) => idx * 5,
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: useSmooth,
        showSymbol: false,
        lineStyle: { color: '#F59E0B', width: 1 },
        animationDuration: 1500,
        animationEasing: 'cubicOut' as const,
        animationDelay: (idx: number) => idx * 5,
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: useSmooth,
        showSymbol: false,
        lineStyle: { color: '#06B6D4', width: 1 },
        animationDuration: 1500,
        animationEasing: 'cubicOut' as const,
        animationDelay: (idx: number) => idx * 5,
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
  }
}

export function MetalKlineChart({
  data,
  height = 350,
  colorScheme,
  chartType = 'candlestick',
}: MetalKlineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current, 'dark')
    instanceRef.current = chart

    const { up, down } = getUpDownColors()

    const option =
      chartType === 'line'
        ? buildLineOption(data, up, down)
        : buildCandlestickOption(data, up, down)

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data, colorScheme, chartType])

  return <div ref={chartRef} style={{ width: '100%', height }} />
}
