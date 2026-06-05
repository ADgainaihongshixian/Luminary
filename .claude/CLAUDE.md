# 「流光」— Claude Code 工作手册

> 开始任何任务前必须完整阅读本文件。完整文档见 `README.md`。

---

## 项目概述

**产品：** 流光（Luminary）— 基金 & 贵金属实时监控平台
**版本：** v0.3.0（Phase 3 已完成）
**定位：** 面向年轻投资者（18-35岁），暗色科技感风格

---

## 技术栈

| 层级     | 技术                            | 版本   |
| -------- | ------------------------------- | ------ |
| 包管理   | pnpm + workspace (Monorepo)     | latest |
| 构建     | Vite                            | 5.x    |
| 框架     | React + TypeScript              | 18.x   |
| UI 组件  | shadcn/ui (base-nova) + Radix   | latest |
| 动效     | Framer Motion                   | 11.x   |
| 样式     | Tailwind CSS v4 + CSS Variables | v4     |
| 图表     | ECharts (echarts-for-react)     | 5.x    |
| 状态管理 | Zustand                         | 4.x    |
| 数据请求 | TanStack Query                  | v5     |
| 路由     | React Router                    | v6     |
| 本地存储 | Dexie.js (IndexedDB)            | 4.x    |
| BFF      | Hono                            | v4     |
| 部署     | Cloudflare Workers              | —      |

---

## Monorepo 结构

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

## 路由

| 路径              | 页面        | 说明                             |
| ----------------- | ----------- | -------------------------------- |
| `/`               | Dashboard   | 资产总览、基金摘要、贵金属快卡   |
| `/funds`          | FundList    | 基金持仓列表                     |
| `/funds/:code`    | FundDetail  | 基金详情 + 净值走势图            |
| `/metals`         | MetalList   | 贵金属行情列表                   |
| `/metals/:symbol` | MetalDetail | 贵金属详情 + K线 + 换算器        |
| `/alerts`         | AlertList   | 预警管理                         |
| `/settings`       | Settings    | 设置（主题、配色、数据导入导出） |

---

## 数据库（Dexie.js）

数据库名：`LuminaryDB`，实例在 `packages/app/src/db/db.ts`

| 表名              | 说明         | 主要索引                         |
| ----------------- | ------------ | -------------------------------- |
| `portfolio_funds` | 基金持仓     | id, fundCode, fundType, groupId  |
| `fund_groups`     | 基金分组     | id, sortOrder                    |
| `price_alerts`    | 价格预警规则 | id, assetType, assetCode, status |
| `user_settings`   | 用户设置     | key                              |

---

## 状态管理（Zustand）

| Store               | 持久化    | 说明                  |
| ------------------- | --------- | --------------------- |
| `useFundStore`      | IndexedDB | 基金 CRUD             |
| `useGroupStore`     | IndexedDB | 基金分组 CRUD         |
| `useAlertStore`     | IndexedDB | 预警 CRUD + 触发/重置 |
| `useApiConfigStore` | IndexedDB | Twelve Data API Key   |
| `useMetalStore`     | 内存      | 贵金属价格 + 汇率缓存 |

---

## API 端点（BFF）

所有请求通过 `/api/*` 代理，前端禁止直接调用第三方 URL。

| 端点                                     | 缓存 | 说明                  |
| ---------------------------------------- | ---- | --------------------- |
| `GET /api/funds/search?keyword=`         | 5min | 基金搜索              |
| `GET /api/funds/estimate?code=`          | 1min | 基金实时估值（JSONP） |
| `GET /api/funds/nav?code=&page=&size=`   | 5min | 历史净值              |
| `GET /api/metals/price?symbols=`         | 30s  | 贵金属实时价格        |
| `GET /api/metals/history?symbol=&range=` | 5min | 贵金属历史 K 线       |
| `GET /api/exchange-rate?from=USD&to=CNY` | 5min | 汇率                  |

**数据源：** 新浪财经（金银）、Gold-API（铂金）、Twelve Data（历史）、Open Exchange Rates（汇率）

---

## 数据刷新策略

| 数据类型   | 刷新频率   | 说明                 |
| ---------- | ---------- | -------------------- |
| 贵金属价格 | 30 秒      | `useMetalPrices`     |
| 基金估值   | 15 分钟    | `useFundEstimates`   |
| 汇率       | 5 分钟     | `useExchangeRate`    |
| 预警检测   | 跟随数据源 | 贵金属30s，基金15min |

---

## 核心计算公式

```typescript
// 人民币克价
const cnyPerGram = (usdPerOz / 31.1035) * usdCnyRate

// 当日浮盈
const dailyProfit = holdingAmount * (estimateChangePercent / 100)

// 累计收益（需 costNav）
const totalProfit = (currentNav - costNav) * holdingShares

// 累计收益率
const totalReturnRate = (currentNav / costNav - 1) * 100

// 按金额推算份额
const derivedShares = holdingAmount / costNav
```

---

## 主题系统

### 配色方案（5种）

| 名称   | 变量值   | 主色调    |
| ------ | -------- | --------- |
| 紫霓虹 | `purple` | `#7C3AED` |
| 赛博蓝 | `cyber`  | `#06B6D4` |
| 极光绿 | `aurora` | `#10B981` |
| 落日橙 | `sunset` | `#F97316` |
| 樱花粉 | `sakura` | `#EC4899` |

### 涨跌色

- `green-up`（默认）：涨绿跌红（A股）
- `red-up`：涨红跌绿（港美股）
- 必须通过 `--color-up` / `--color-down` CSS 变量引用，禁止 hardcode

---

## 响应式布局

| 组件   | 移动端（<md）                         | PC 端（md:）                  |
| ------ | ------------------------------------- | ----------------------------- |
| 顶栏   | Logo + 主题 + 设置                    | Logo + 导航标签 + 主题 + 设置 |
| 底栏   | 5个 Tab（首页/基金/贵金属/预警/设置） | 无                            |
| 贵金属 | 单列                                  | 三列网格                      |
| 弹窗   | Sheet 底部弹出                        | Dialog 居中                   |

---

## 编码规范

### 命名规则

- 组件：`PascalCase`（`FundCard.tsx`）
- Hook：`use` 前缀（`useFundData.ts`）
- 工具函数：`camelCase`（`formatPrice.ts`）
- 常量：`SCREAMING_SNAKE_CASE`（`METAL_SYMBOLS`）

### React 规范

- 函数组件 + Hooks
- 优先具名导出，页面可用默认导出
- 列表用稳定 `key`（数据 ID，不用 index）

### 样式规范

- 优先 Tailwind 工具类
- 用 `cn()` 合并 className
- 禁止内联 style 传颜色
- 圆角：卡片 `rounded-xl`，按钮 `rounded-lg`，标签 `rounded`

### 导入顺序

React → 第三方库 → 内部包 → 相对路径 → 样式

---

## 常用命令

```bash
pnpm install                    # 安装依赖
pnpm dev                        # 启动前端（Vite）
pnpm --filter @fund-monitor/bff dev  # 启动 BFF（8787端口）
pnpm build                      # 构建全部
pnpm lint                       # 代码检查
pnpm format                     # 格式化
pnpm dlx shadcn@latest add button --cwd packages/app  # 安装 shadcn 组件
```

---

## 重要约束

1. **禁止**前端直接调用第三方 URL，必须通过 `/api/*` 代理
2. **禁止**在前端暴露 API 密钥
3. **禁止**引入 Ant Design 等非既定 UI 库
4. **禁止**用 localStorage/sessionStorage 存业务数据（统一 Dexie.js）
5. **禁止** hardcode 涨跌颜色（必须用 CSS 变量）
6. **禁止**预警重复触发（status 变 triggered 后停止）
7. **禁止**非交易时段轮询基金估值

---

## 参考文档

- 完整文档：`README.md`
- PRD：`.claude/documents/fund-metals-monitor-PRD.md`
- shadcn/ui：https://ui.shadcn.com
- Dexie.js：https://dexie.org/docs
- TanStack Query：https://tanstack.com/query/v5
- ECharts：https://echarts.apache.org/zh/index.html
- Hono：https://hono.dev
