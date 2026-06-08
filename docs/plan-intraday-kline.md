# 实现贵金属"1天"分时走势图方案

## 目标

选择"1天"时，展示当天的分时走势图（5分钟K线），而非日K线。

## 数据源策略

| 品种    | 数据源                                          | 方式          | 说明                         |
| ------- | ----------------------------------------------- | ------------- | ---------------------------- |
| XAU/XAG | 新浪期货 `InnerFuturesNewService.getFewMinLine` | 免费，无需Key | 国内直连，5分钟K线           |
| XPT/XPD | Twelve Data `time_series?interval=5min`         | 需API Key     | 改造现有函数支持动态interval |

## 改动清单（4层，共6个文件）

### 1. BFF 服务层 — `sina-finance.ts`

**新增** `getSinaIntraday()` 函数：

- 调用 `https://stock.finance.sina.com.cn/futures/api/jsonp.php/var/InnerFuturesNewService.getFewMinLine?symbol=AU0&type=5`
- `type=5` 表示5分钟级别
- 解析返回的 JSONP 数据，格式与日K类似：`[{d:"datetime", o, h, l, c}, ...]`
- CNY/克 → USD/盎司 换算（复用现有 `toUsdOz` 逻辑）
- 返回 `SinaHistoryEntry[]`（复用现有类型）

### 2. BFF 服务层 — `metals-api.ts`

**修改** `getMetalHistory()`：

- 当 `range === '1D'` 时，走分时数据分支
- XAU/XAG：调用新的 `getSinaIntraday()`
- XPT/XPD：调用改造后的 `fetchTwelveDataHistory()` 传入 `interval='5min'`

**修改** `fetchTwelveDataHistory()`：

- 新增可选参数 `interval`，默认 `'1day'`
- `1D` range 时传入 `interval='5min'`，`outputsize=48`（4小时×12段/小时）

**修改** `filterByRange()` 和 `RANGE_OUTPUTSIZE`：

- 新增 `'1D': 48` 映射（虽然1D主要走分时分支，但保持一致性）

### 3. BFF 路由层 — `metals.ts`

**修改**缓存 TTL：

- `1D` range 的缓存 TTL 从 300s 降为 60s（分时数据更新更频繁）

### 4. 前端 data-service — `metal.ts`

无需修改，`getMetalHistory(symbol, range)` 已支持透传 `range` 参数。

### 5. 前端图表组件 — `MetalKlineChart.tsx`

**新增** `chartType` prop：

- `'candlestick'`（默认）：K线图，用于 5D/1W/1M/3M/1Y
- `'line'`：分时折线图，用于 1D

**分时图模式配置**：

- 主系列改为 `type: 'line'`，显示收盘价连线
- 隐藏 MA5/MA20（分时数据点少，均线无意义）
- X轴标签显示时间（`HH:mm`）而非日期
- 添加昨收参考线（`markLine`）
- `smooth: false`（分时数据需要精确显示）
- tooltip 显示时间 + 价格

### 6. 前端页面 — `MetalDetail.tsx`

**恢复** `1D` 选项（改回标签为"1天"）：

```ts
const TIME_RANGES = [
  { label: '1天', value: '1D' },
  { label: '5天', value: '5D' },
  ...
]
```

**新增** `chartType` 计算：

```ts
const chartType = range === '1D' ? 'line' : 'candlestick'
```

**传递** `chartType` 给 `MetalKlineChart`：

```tsx
<MetalKlineChart data={ohlcData} height={350} colorScheme={colorScheme} chartType={chartType} />
```

## 数据流

```
用户选择"1天"
  → MetalDetail: range='1D', chartType='line'
  → getMetalHistory('XAU', '1D')
  → BFF: range==='1D' → getSinaIntraday('AU0', rate)
  → 新浪 API: InnerFuturesNewService.getFewMinLine?symbol=AU0&type=5
  → 解析 JSONP → CNY/g → USD/oz → 返回 ~48 个5分钟K线点
  → MetalKlineChart: chartType='line' → 分时折线图
```

## 注意事项

- 新浪期货分时数据仅在**交易时段**有数据（上海期货交易所：周一-周五 9:00-15:00，21:00-次日2:30）
- 非交易时段返回空数组，前端需兜底显示"暂无分时数据"
- Twelve Data 的5分钟数据有 API 调用频率限制，缓存TTL设为60s
