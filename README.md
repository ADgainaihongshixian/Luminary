---

## 项目概述

**产品名称：** 流光（Luminary）
**产品定位：** 面向年轻投资者（18-35岁）的基金 & 贵金属实时监控平台
**核心功能：** 基金持仓管理 + 贵金属实时行情 + 价格预警通知
**视觉风格：** 暗色科技感，霓虹渐变，Bloomberg Terminal 年轻化版本
**当前版本：** v0.3.0（Phase 3 已完成）

---

## 技术栈

| 层级     | 技术                                      | 版本       |
| -------- | ----------------------------------------- | ---------- |
| 包管理   | pnpm + workspace                          | latest     |
| 构建     | Vite                                      | 5.x        |
| 框架     | React + TypeScript                        | 18.x / 5.x |
| UI 组件  | shadcn/ui (base-nova) + Radix UI          | latest     |
| 动效     | Framer Motion                             | 11.x       |
| 样式     | Tailwind CSS v4 + CSS Variables           | v4         |
| 图表     | ECharts（echarts-for-react）              | 5.x        |
| 状态管理 | Zustand                                   | 4.x        |
| 数据请求 | TanStack Query（React Query）             | v5         |
| 路由     | React Router                              | v6         |
| 本地存储 | Dexie.js（IndexedDB）                     | 4.x        |
| BFF 后端 | Hono                                      | v4         |
| 部署平台 | Cloudflare Workers                        | —          |
| 代码规范 | ESLint 9 (Flat Config) + Prettier + Husky | —          |

**绝不引入：** Ant Design、MUI、Chakra UI、任何其他 CSS-in-JS 运行时方案。

---

## Monorepo 包结构

```
Luminary/
├── package.json                    # 根 workspace，scripts 聚合入口
├── pnpm-workspace.yaml             # packages/* 声明
├── eslint.config.mjs               # ESLint Flat Config
├── .prettierrc                     # 无分号、单引号、100字宽
├── .husky/                         # Git Hooks（pre-commit: lint-staged）
│
├── packages/
│   ├── app/                        # 主应用（React SPA）
│   │   ├── package.json
│   │   ├── vite.config.ts          # Vite 配置（代理、分包、gzip）
│   │   ├── components.json         # shadcn/ui 配置
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx            # 应用入口
│   │       ├── App.tsx             # 根组件 + 路由（React.lazy 懒加载）
│   │       ├── components/
│   │       │   ├── ui/             # shadcn/ui 原子组件
│   │       │   ├── layout/         # 布局组件
│   │       │   ├── charts/         # 图表组件
│   │       │   ├── motion/         # 动效组件
│   │       │   ├── ErrorBoundary.tsx
│   │       │   ├── PageContainer.tsx
│   │       │   ├── OfflineBanner.tsx
│   │       │   └── MetalIcon.tsx
│   │       ├── pages/              # 页面组件
│   │       ├── store/              # Zustand stores
│   │       ├── hooks/              # 自定义 Hooks
│   │       ├── db/                 # Dexie.js 数据库
│   │       ├── constants/          # 常量
│   │       ├── lib/                # 工具函数
│   │       └── styles/
│   │           └── globals.css     # Tailwind + CSS Variables + 主题 Token
│   │
│   ├── bff/                        # BFF 后端（Hono）
│   │   ├── package.json
│   │   ├── wrangler.toml           # Cloudflare Workers 配置
│   │   └── src/
│   │       ├── index.ts            # Hono 应用主入口
│   │       ├── dev.ts              # 本地开发入口（Node.js, 8787端口）
│   │       ├── routes/             # 路由
│   │       │   ├── funds.ts        # 基金端点
│   │       │   ├── metals.ts       # 贵金属端点
│   │       │   └── exchange.ts     # 汇率端点
│   │       ├── services/           # 服务层（API 适配器）
│   │       └── cache.ts            # 内存缓存工具
│   │
│   ├── data-service/               # 前端数据请求层（fetch 封装）
│   │   └── src/api/
│   │       ├── fund.ts             # searchFunds, getFundEstimate, getFundNavHistory
│   │       ├── metal.ts            # getMetalPrices, getMetalHistory, setTwelveDataKey
│   │       └── exchange.ts         # getExchangeRate
│   │
│   ├── shared/                     # 跨包共享：类型、常量、纯函数
│   │   └── src/
│   │       ├── types/              # fund.ts, metal.ts, alert.ts, settings.ts
│   │       ├── constants/          # metals.ts, funds.ts
│   │       └── utils/              # format.ts, price.ts
│   │
│   └── ui/                         # UI 工具库（cn 函数）
│       └── src/index.ts
│
└── tools/
    └── tsconfig/                   # 共享 TypeScript 配置
        ├── base.json
        └── react.json
```

---

## 路由结构

使用 `react-router-dom` v6 + `React.lazy` 懒加载：

| 路径              | 页面        | 说明                                         |
| ----------------- | ----------- | -------------------------------------------- |
| `/`               | Dashboard   | 资产总览，基金摘要，贵金属快捷行情，预警状态 |
| `/funds`          | FundList    | 我的基金持仓列表（分组筛选、搜索添加）       |
| `/funds/:code`    | FundDetail  | 单只基金完整数据 + 历史净值走势图            |
| `/metals`         | MetalList   | 所有贵金属实时行情卡片（30s 自动刷新）       |
| `/metals/:symbol` | MetalDetail | 单品种详情 + K线图 + 换算器                  |
| `/alerts`         | AlertList   | 预警规则管理列表（监控中/已触发）            |
| `/settings`       | Settings    | 主题、配色、涨跌色、API Key、数据导入导出    |

页面切换使用 `framer-motion` AnimatePresence 实现淡入淡出动效。

---

## 主题与设计系统

### CSS Variables Token（在 `globals.css` 中定义）

```css
/* 暗色主题（默认）*/
.dark {
  --background: #0d0f1a;
  --card: #141726;
  --primary: #7c3aed;
  --color-up: #22c55e;
  --color-down: #ef4444;
  --foreground: #f1f5f9;
  --muted: #334155;
  --border: #1e2433;
}

/* 亮色主题 */
:root {
  --background: #f8fafc;
  --card: #ffffff;
  /* ... */
}
```

### 5 种主题配色方案

| 方案名称 | CSS 变量值 | 主色调    |
| -------- | ---------- | --------- |
| 紫霓虹   | `purple`   | `#7C3AED` |
| 赛博蓝   | `cyber`    | `#06B6D4` |
| 极光绿   | `aurora`   | `#10B981` |
| 落日橙   | `sunset`   | `#F97316` |
| 樱花粉   | `sakura`   | `#EC4899` |

### Tailwind 配置要点

- `darkMode: 'class'` — 通过 `<html class="dark">` 切换主题
- 使用 `tailwindcss/vite` 插件（Tailwind CSS v4）
- 使用 `cn()` 工具函数合并 className（`clsx` + `tailwind-merge`）

### 涨跌色偏好

用户设置支持两种模式，存储在 `user_settings` 表：

- `green-up`（默认）：涨 = `--color-up: #22C55E`，跌 = `--color-down: #EF4444`（A股习惯）
- `red-up`：涨 = `#EF4444`，跌 = `#22C55E`（港美股习惯）

切换时动态修改 CSS Variables，所有用到涨跌色的组件自动响应，**不要** hardcode 颜色值。

### 自定义 CSS 工具类

| 类名            | 说明           |
| --------------- | -------------- |
| `glass-card`    | 毛玻璃效果卡片 |
| `text-gradient` | 渐变文字效果   |
| `pulse-glow`    | 预警脉冲光晕   |

### 动效规范

| 场景         | 实现                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 数字价格更新 | `NumberRoller` 组件，Framer Motion spring 动画从旧值滚动到新值             |
| 涨跌闪烁     | `PriceFlash` 组件，价格更新时涨/跌色背景闪烁 0.5s 渐隐                     |
| 列表首屏进入 | `FadeIn` + `StaggerContainer`，`staggerChildren` + `fadeIn` + `translateY` |
| 预警触发     | 卡片边框 `box-shadow` 脉冲光晕（`pulse-glow` 类）                          |
| 页面切换     | React Router + Framer Motion `AnimatePresence`，`opacity: 0→1`，100ms      |

---

## 数据库设计（Dexie.js / IndexedDB）

数据库实例在 `packages/app/src/db/db.ts`，数据库名称 `LuminaryDB`。

### 表结构

**`portfolio_funds`** — 用户持仓基金

| 字段名        | 类型                 | 说明                 | 索引 |
| ------------- | -------------------- | -------------------- | ---- |
| id            | string（UUID）       | 主键                 | ✅   |
| fundCode      | string               | 6位基金代码          | ✅   |
| fundName      | string               | 基金名称             | —    |
| fundType      | string               | 基金类型             | ✅   |
| holdingMode   | 'amount' \| 'shares' | 持仓录入方式         | —    |
| holdingAmount | number               | 持仓金额（元）       | —    |
| holdingShares | number               | 持有份额             | —    |
| costNav       | number \| null       | 买入成本净值（可选） | —    |
| groupId       | string \| null       | 分组 ID              | ✅   |
| remark        | string               | 备注                 | —    |
| sortOrder     | number               | 排序权重             | ✅   |
| createdAt     | number               | 创建时间戳           | ✅   |
| updatedAt     | number               | 更新时间戳           | —    |

**`fund_groups`** — 基金分组

| 字段名    | 类型           | 说明       | 索引 |
| --------- | -------------- | ---------- | ---- |
| id        | string（UUID） | 主键       | ✅   |
| name      | string         | 分组名称   | —    |
| sortOrder | number         | 排序权重   | ✅   |
| createdAt | number         | 创建时间戳 | ✅   |

**`price_alerts`** — 价格预警规则

| 字段名      | 类型                    | 说明                            | 索引 |
| ----------- | ----------------------- | ------------------------------- | ---- |
| id          | string（UUID）          | 主键                            | ✅   |
| assetType   | 'metal' \| 'fund'       | 资产类型                        | ✅   |
| assetCode   | string                  | 品种代码（如 'XAU' 或基金代码） | ✅   |
| assetName   | string                  | 展示名称                        | —    |
| targetPrice | number                  | 目标价格                        | —    |
| priceUnit   | string                  | 价格单位（如 'CNY/g'）          | —    |
| status      | 'active' \| 'triggered' | 预警状态                        | ✅   |
| triggeredAt | number \| null          | 触发时间戳                      | —    |
| createdAt   | number                  | 创建时间戳                      | ✅   |

**`user_settings`** — 用户偏好

| 字段名 | 类型   | 说明       | 索引 |
| ------ | ------ | ---------- | ---- |
| key    | string | 配置项 key | ✅   |
| value  | any    | 配置值     | —    |

> 用户设置包括：theme（主题模式）、themeColor（配色方案）、colorScheme（涨跌色偏好）、twelveDataKey（API Key）。

---

## 状态管理（Zustand）

| Store               | 文件                   | 持久化    | 说明                      |
| ------------------- | ---------------------- | --------- | ------------------------- |
| `useFundStore`      | `useFundStore.ts`      | IndexedDB | 基金持仓 CRUD             |
| `useGroupStore`     | `useGroupStore.ts`     | IndexedDB | 基金分组 CRUD             |
| `useAlertStore`     | `useAlertStore.ts`     | IndexedDB | 预警规则 CRUD + 触发/重置 |
| `useApiConfigStore` | `useApiConfigStore.ts` | IndexedDB | Twelve Data API Key 管理  |
| `useMetalStore`     | `useMetalStore.ts`     | 内存      | 贵金属实时价格 + 汇率缓存 |

---

## API 接口（BFF 代理层）

所有第三方请求通过 `packages/bff/` 的 Hono 后端代理，**前端永远不直接调用第三方 URL**。

### BFF 技术栈

- **框架：** Hono v4
- **部署：** Cloudflare Workers（生产）+ Node.js（开发，端口 8787）
- **缓存：** 内存 Map 缓存，带 TTL 过期机制

### 基金接口（上游：东方财富）

| 路由                               | 方法 | 说明                   | 缓存时长 |
| ---------------------------------- | ---- | ---------------------- | -------- |
| `/api/funds/search?keyword=`       | GET  | 基金搜索               | 5min     |
| `/api/funds/estimate?code=`        | GET  | 实时估值（JSONP 解析） | 1min     |
| `/api/funds/nav?code=&page=&size=` | GET  | 历史净值分页           | 5min     |

**JSONP 解析：** 估值接口返回格式 `jsonpgz({...});`，BFF 层用正则剥离包装后返回 JSON。

### 贵金属接口

| 路由                                    | 方法 | 上游数据源                         | 缓存时长 |
| --------------------------------------- | ---- | ---------------------------------- | -------- |
| `/api/metals/price?symbols=XAU,XAG,XPT` | GET  | 新浪财经（金银）+ Gold-API（铂金） | 30s      |
| `/api/metals/history?symbol=&range=`    | GET  | Twelve Data API（需 API Key）      | 5min     |

**数据源优先级策略：**

- 金银实时价格：新浪财经 `hq.sinajs.cn`（国内直连 ~350ms，CNY/克 → USD/盎司 换算）
- 铂金实时价格：Gold-API `api.gold-api.com`（海外兜底）
- 历史 K 线：Twelve Data API（需用户配置 API Key）
- 汇率：Open Exchange Rates `open.er-api.com`（免费）

### 汇率接口

| 路由                                 | 方法 | 上游                | 缓存时长 |
| ------------------------------------ | ---- | ------------------- | -------- |
| `/api/exchange-rate?from=USD&to=CNY` | GET  | Open Exchange Rates | 5min     |

### 环境变量

BFF 密钥配置在 `packages/bff/wrangler.toml` 或环境变量：

```bash
TWELVE_DATA_KEY=          # Twelve Data API Key（可选，用户也可在设置页配置）
```

前端通过 `data-service` 包的 `setTwelveDataKey()` 函数传递用户配置的 Key。

---

## 数据刷新策略

### 基金估值

```typescript
// useFundEstimates.ts - React Query 配置
{
  refetchInterval: 15 * 60 * 1000,  // 15分钟
  staleTime: 14 * 60 * 1000,
}
```

### 贵金属实时价格

```typescript
// useMetalPrices.ts
{
  refetchInterval: 30 * 1000,   // 30秒
  staleTime: 25 * 1000,
}
```

### 汇率

```typescript
// useExchangeRate.ts
{
  refetchInterval: 5 * 60 * 1000,  // 5分钟
  staleTime: 4 * 60 * 1000,
}
```

---

## 价格计算公式

```typescript
// 人民币克价
const cnyPerGram = (usdPerOz / 31.1035) * usdCnyRate

// 当日浮盈（元）
const dailyProfit = holdingAmount * (estimateChangePercent / 100)

// 累计收益（元）—— 需要 costNav
const totalProfit = (currentNav - costNav) * holdingShares

// 累计收益率
const totalReturnRate = (currentNav / costNav - 1) * 100

// 按金额录入时推算持有份额
const derivedShares = holdingAmount / costNav

// 相较昨收涨跌幅
const changeFromClose = ((currentPrice - prevClose) / prevClose) * 100

// 相较今日开盘涨跌幅
const changeFromOpen = ((currentPrice - openPrice) / openPrice) * 100
```

---

## 价格预警逻辑

```typescript
// useAlertChecker.ts - 每次收到新的实时价格后执行检查
// 贵金属：30秒检测一次（跟随实时价格刷新）
// 基金：15分钟检测一次（跟随估值刷新）

function checkAlerts(alerts: PriceAlert[], currentPrice: number, assetCode: string) {
  const active = alerts.filter((a) => a.assetCode === assetCode && a.status === 'active')

  for (const alert of active) {
    if (currentPrice <= alert.targetPrice) {
      // 1. 触发系统通知
      triggerNotification(alert, currentPrice)
      // 2. 更新数据库状态（仅触发一次）
      db.price_alerts.update(alert.id, {
        status: 'triggered',
        triggeredAt: Date.now(),
      })
    }
  }
}

function triggerNotification(alert: PriceAlert, currentPrice: number) {
  if (Notification.permission !== 'granted') return
  new Notification('流光 · 价格预警触发 🔔', {
    body: `${alert.assetName} 现价 ${formatPrice(currentPrice, alert.priceUnit)}，已达到您设定的目标价 ${formatPrice(alert.targetPrice, alert.priceUnit)}`,
    icon: '/logo.png',
    tag: alert.id, // 防止重复通知
  })
}
```

**权限处理：**

- `Notification.permission === 'granted'` → 直接使用
- `'default'` → 弹 Dialog 引导，用户确认后 `Notification.requestPermission()`
- `'denied'` → 降级为应用内悬浮 Banner，不再请求权限
- 微信内置浏览器：`typeof Notification === 'undefined'`，直接走 Banner 降级

---

## 响应式布局规则

Tailwind 断点：

| 断点 | 宽度        | 说明       |
| ---- | ----------- | ---------- |
| xs   | < 576px     | 小屏手机   |
| sm   | 576-767px   | 大屏手机   |
| md   | 768-1023px  | 平板       |
| lg   | 1024-1439px | 笔记本     |
| xl   | ≥ 1440px    | 桌面显示器 |

### 布局适配

| 组件     | 移动端（<md）                                      | PC 端（md:）                            |
| -------- | -------------------------------------------------- | --------------------------------------- |
| 顶部导航 | `MobileDropdown`：Logo + 主题 + 设置               | `TopNav`：Logo + 导航标签 + 主题 + 设置 |
| 底部导航 | `MobileNav`：5个 Tab（首页/基金/贵金属/预警/设置） | 无                                      |
| 基金列表 | 单列卡片                                           | 单列卡片                                |
| 贵金属   | 单列                                               | 三列网格（`md:grid-cols-3`）            |
| 弹窗     | `<Sheet>` 底部弹出                                 | `<Dialog>` 居中                         |
| 图表高度 | `h-[250px]`                                        | `h-[650px]`                             |

所有可点击元素最小触摸区域 `min-h-[44px] min-w-[44px]`。

---

## 自定义 Hooks

| Hook               | 文件                  | 说明                            |
| ------------------ | --------------------- | ------------------------------- |
| `useMetalPrices`   | `useMetalPrices.ts`   | 贵金属实时价格，30秒轮询        |
| `useFundEstimate`  | `useFundEstimate.ts`  | 单只基金估值，15分钟轮询        |
| `useFundEstimates` | `useFundEstimates.ts` | 批量基金估值（useQueries）      |
| `useFundSearch`    | `useFundSearch.ts`    | 基金搜索，debounce 300ms        |
| `useExchangeRate`  | `useExchangeRate.ts`  | USD/CNY 汇率，5分钟轮询         |
| `useAlertChecker`  | `useAlertChecker.ts`  | 预警检测，触发 Web Notification |
| `useNotification`  | `useNotification.ts`  | 通知权限管理                    |
| `useTheme`         | `useTheme.ts`         | 主题管理（dark/light/system）   |
| `useThemeColor`    | `useThemeColor.ts`    | 配色方案（5种）                 |
| `useColorScheme`   | `useColorScheme.ts`   | 涨跌色偏好（green-up/red-up）   |
| `useMediaQuery`    | `useMediaQuery.ts`    | CSS 媒体查询                    |
| `useOnlineStatus`  | `useOnlineStatus.ts`  | 在线状态检测                    |

---

## 组件结构

### 布局组件（`components/layout/`）

| 组件                 | 说明                                     |
| -------------------- | ---------------------------------------- |
| `AppLayout.tsx`      | 主布局容器，PC 端顶栏 + 移动端底部 Tab   |
| `TopNav.tsx`         | PC 端顶栏：Logo + 导航标签 + 主题 + 设置 |
| `MobileNav.tsx`      | 移动端底部 Tab Bar（5个导航项）          |
| `MobileDropdown.tsx` | 移动端顶部栏：Logo + 主题 + 设置         |

### 图表组件（`components/charts/`）

| 组件                  | 说明                                           |
| --------------------- | ---------------------------------------------- |
| `FundNavChart.tsx`    | 基金净值走势图（ECharts LineChart + DataZoom） |
| `MetalKlineChart.tsx` | 贵金属 K 线图（CandlestickChart + MA5/MA20）   |

### 动效组件（`components/motion/`）

| 组件               | 说明                                    |
| ------------------ | --------------------------------------- |
| `FadeIn.tsx`       | 淡入动效 + StaggerContainer/StaggerItem |
| `NumberRoller.tsx` | 数字滚动动效（Framer Motion spring）    |
| `PriceFlash.tsx`   | 涨跌闪烁效果（0.5s 渐隐）               |

### UI 组件（`components/ui/`，基于 shadcn/ui）

badge, button, card, dialog, dropdown-menu, input, label, progress, responsive-dialog, scroll-area, select, sheet, skeleton, table, tabs

---

## shadcn/ui 使用规范

- 安装组件：`pnpm dlx shadcn@latest add <component> --cwd packages/app`
- 生成的文件在 `packages/app/src/components/ui/`，**可以修改**以适配主题
- 配置文件 `components.json` 使用 base-nova 风格
- 不要重复造 Button、Input、Dialog 等已有原子组件，直接使用 shadcn 的

---

## ECharts 使用规范

- 使用 `echarts-for-react` 的 `ReactECharts` 组件
- 图表背景色设为 `transparent`，由父容器卡片提供背景
- 颜色系列（`color`）跟随 CSS Variables，使用 `getComputedStyle` 在运行时读取

```typescript
const upColor = getComputedStyle(document.documentElement).getPropertyValue('--color-up').trim()
```

- K 线图（蜡烛图）用于贵金属历史价格，面积折线图用于基金净值走势
- 支持时间范围切换：1W / 1M / 3M / 6M / 1Y / ALL

---

## 数据导入导出格式

```typescript
interface ExportData {
  version: '1.0'
  exportedAt: number
  portfolioFunds: PortfolioFund[]
  fundGroups: FundGroup[]
  priceAlerts: PriceAlert[]
  userSettings: UserSetting[]
}
```

导入时校验 `version` 字段，未来版本升级做迁移处理。导入前弹 Dialog 二次确认（当前数据将被覆盖）。

---

## 错误处理约定

- API 请求失败：展示 `ErrorState` 组件（含重试按钮），不抛出未捕获异常
- 数据加载中：展示 `Skeleton` 骨架屏，不使用 loading spinner 遮罩整页
- 空数据状态：展示引导性空态组件（含添加入口），文案友好
- IndexedDB 操作失败：toast 提示 + console.error，不中断主流程
- 全局错误边界：`ErrorBoundary.tsx` 捕获渲染错误，展示友好 UI + 重试按钮
- 离线状态：`OfflineBanner.tsx` 网络断开时显示提示

---

## 代码规范

### TypeScript

- 全量使用 TypeScript，`strict: true`，禁止 `any`（确实需要时用 `unknown` + 类型守卫）
- 接口用 `interface`，联合类型用 `type`
- 枚举用 `const` 对象 + `as const`，不用 `enum`

### React

- 全部使用函数组件 + Hooks
- 组件文件使用 PascalCase（`FundCard.tsx`）
- 自定义 Hook 命名以 `use` 开头，放在 `hooks/` 目录
- 避免在 JSX 中写内联函数（性能热点路径用 `useCallback`）
- 列表渲染必须提供稳定的 `key`（用数据 ID，不用 index）
- 优先使用具名导出（named export），页面组件可用默认导出

### 样式

- 优先使用 Tailwind 工具类
- 组件特定样式用 `cn()` 合并（来自 `clsx` + `tailwind-merge`）
- 严禁使用内联 `style` 传递颜色（用 CSS Variables 和 Tailwind Token 代替）
- 涨跌色必须通过 `--color-up` / `--color-down` 变量引用
- 圆角：卡片 `rounded-xl`（12px），按钮 `rounded-lg`（8px），标签 `rounded`（4px）

### 文件命名

- 组件：`PascalCase`（`FundCard.tsx`）
- Hook：`camelCase` with `use` 前缀（`useFundData.ts`）
- 工具函数：`camelCase`（`formatPrice.ts`）
- 常量：`SCREAMING_SNAKE_CASE`（`METAL_SYMBOLS`）
- 类型文件：`camelCase`（`fund.ts`）

### 导入顺序

React → 第三方库 → 内部包（@fund-monitor/shared 等）→ 相对路径 → 样式文件

---

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动前端开发服务器
pnpm dev

# 启动 BFF 开发服务器（端口 8787）
pnpm --filter @fund-monitor/bff dev

# 构建全部包
pnpm build

# 构建仅 app
pnpm --filter app build

# 安装 shadcn 组件
pnpm dlx shadcn@latest add button --cwd packages/app

# 添加新的 workspace 包依赖
pnpm --filter app add @fund-monitor/shared

# 代码检查
pnpm lint

# 格式化
pnpm format
```

---

## 部署

### 平台

- **BFF 后端：** Cloudflare Workers
- **前端：** Cloudflare Pages（或 Vercel）

### Cloudflare Workers 配置

`packages/bff/wrangler.toml`：

```toml
name = "luminary-bff"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
```

---

## 重要约束（禁止事项）

1. **禁止**前端直接调用东方财富、新浪财经、Gold-API 等第三方 URL，必须通过 `/api/*` 代理
2. **禁止**在前端代码中暴露 API 密钥
3. **禁止**引入 Ant Design 或任何其他非既定 UI 库
4. **禁止**使用 `localStorage` / `sessionStorage` 存储持久化业务数据（统一用 Dexie.js）
5. **禁止** hardcode 涨跌颜色值，必须引用 CSS Variables
6. **禁止**在同一品种预警上反复触发通知（status 变 `triggered` 后停止检查）
7. **禁止**在非交易时段对基金估值接口发起轮询请求

---

## 参考文档

- PRD：`docs/fund-metals-monitor-PRD.md`（v2.0.0）
- shadcn/ui 文档：https://ui.shadcn.com
- Dexie.js 文档：https://dexie.org/docs
- TanStack Query 文档：https://tanstack.com/query/v5
- ECharts 文档：https://echarts.apache.org/zh/index.html
- Hono 文档：https://hono.dev
- Cloudflare Workers 文档：https://developers.cloudflare.com/workers
