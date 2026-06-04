# 「流光」— 基金 & 贵金属实时监控平台

## 项目概述

「流光」是一款面向年轻投资者（18-35 岁）的基金与贵金属实时行情监控 Web 应用。核心功能包括：基金持仓管理与实时估值、贵金属（黄金/白银/铂金）实时价格监控、自定义价格预警通知。

**完整需求文档：** 参见项目根目录 `fund-metals-monitor-PRD.md`

---

## 技术栈

| 层级       | 技术选型                                | 版本       |
| ---------- | --------------------------------------- | ---------- |
| 包管理     | pnpm + Workspace (Monorepo)             | latest     |
| 构建工具   | Vite                                    | 5.x        |
| 前端框架   | React + TypeScript                      | 18.x / 5.x |
| UI 组件    | shadcn/ui + Radix UI                    | latest     |
| 动效       | Framer Motion                           | latest     |
| 样式       | Tailwind CSS v4 + CSS Variables         | v4         |
| 图表       | ECharts (echarts-for-react)             | 5.x        |
| 状态管理   | Zustand                                 | 4.x        |
| 本地持久化 | IndexedDB (Dexie.js)                    | latest     |
| 网络请求   | Axios + TanStack Query (React Query v5) | v5         |
| 路由       | React Router                            | v6         |
| 通知       | Web Notifications API                   | —          |

---

## Monorepo 结构

```
fund-monitor/
├── package.json                  # 根 workspace
├── pnpm-workspace.yaml
├── packages/
│   ├── app/                      # 主应用（React SPA）
│   │   └── src/
│   │       ├── components/ui/    # shadcn/ui 原子组件
│   │       ├── pages/            # 页面组件
│   │       ├── store/            # Zustand stores
│   │       ├── hooks/            # 自定义 Hooks
│   │       ├── db/               # Dexie.js 数据库
│   │       ├── styles/           # 全局样式 + 主题变量
│   │       └── utils/            # 工具函数
│   ├── shared/                   # 共享类型、常量、纯函数工具
│   │   └── src/
│   │       ├── types/            # TypeScript 类型定义
│   │       ├── constants/        # 品种列表、枚举
│   │       └── utils/            # 价格计算、格式化
│   ├── ui/                       # 业务组件库（基于 shadcn/ui 二次封装）
│   │   └── src/
│   │       ├── FundCard/
│   │       ├── MetalCard/
│   │       ├── PriceChart/
│   │       ├── AlertBadge/
│   │       ├── NumberRoller/
│   │       └── PriceChange/
│   └── data-service/             # 数据请求层（API adapters）
│       └── src/api/
│           ├── fund.ts
│           ├── metal.ts
│           └── exchange.ts
└── tools/
    ├── eslint-config/
    └── tsconfig/
```

---

## 编码规范

### 通用规则

- **语言：** 所有代码使用 TypeScript，严格模式
- **命名：** 组件用 PascalCase，函数/变量用 camelCase，常量用 UPPER_SNAKE_CASE，文件名用 kebab-case 或 PascalCase（组件文件）
- **导入顺序：** React → 第三方库 → 内部包（@fund-monitor/shared 等）→ 相对路径 → 样式文件
- **导出：** 优先使用具名导出（named export），页面组件可用默认导出
- **注释：** 复杂逻辑必须有注释，使用 JSDoc 格式

### React 规范

- 优先使用函数组件 + Hooks
- 组件文件结构：types → hooks → helpers → 组件主体 → 默认导出
- Props 接口命名：`XxxProps`，与组件同名
- 避免内联样式，使用 Tailwind CSS 工具类
- 使用 `cn()` 工具函数合并 className（shadcn/ui 惯例）

### 样式规范

- 使用 Tailwind CSS 工具类，不写自定义 CSS（除全局变量）
- 主题色通过 CSS Variables 定义在 `globals.css`
- 暗色模式使用 Tailwind `dark:` 前缀
- 数字字体使用 `font-mono`（JetBrains Mono）
- 圆角：卡片 `rounded-xl`（12px），按钮 `rounded-lg`（8px），标签 `rounded`（4px）

### 状态管理

- 服务端数据（API 返回的行情数据）用 TanStack Query 管理
- 客户端状态（用户设置、UI 状态）用 Zustand 管理
- 持久化数据（基金持仓、预警规则）用 Dexie.js + IndexedDB

### 数据流

```
用户操作 → Zustand store 更新 UI 状态
                ↓
         Dexie.js 持久化到 IndexedDB
                ↓
         React Query 轮询 API 数据
                ↓
         计算层（收益、涨跌幅、换算）
                ↓
         组件渲染（Framer Motion 动效）
```

---

## 设计规范

### 颜色体系

| Token          | 值                                          | 用途               |
| -------------- | ------------------------------------------- | ------------------ |
| `--background` | `#0D0F1A`                                   | 主背景（深夜蓝黑） |
| `--card`       | `#141726`                                   | 卡片背景           |
| `--primary`    | `#7C3AED`                                   | 主强调色（紫霓虹） |
| `--color-up`   | `#22C55E`                                   | 涨色（默认绿涨）   |
| `--color-down` | `#EF4444`                                   | 跌色（默认红跌）   |
| 主渐变         | `linear-gradient(135deg, #7C3AED, #06B6D4)` | 渐变强调           |

### 字体

- 数字/代码：`JetBrains Mono`（`font-mono`）
- 中文正文：`PingFang SC / HarmonyOS Sans`

### 动效

- 数字变化：Framer Motion Odometer 滚动
- 涨跌闪烁：价格更新时 0.5s 渐隐
- 卡片进入：staggered fade-in + translateY
- 预警触发：脉冲光晕边框
- 页面切换：淡入淡出 100ms

### 响应式

| 断点 | 宽度        | 布局                     |
| ---- | ----------- | ------------------------ |
| xs   | < 576px     | 移动端底部 Tab Bar，单列 |
| sm   | 576-767px   | 大屏手机，单列           |
| md   | 768-1023px  | 平板，过渡               |
| lg   | 1024-1439px | PC 侧边栏 + 内容区       |
| xl   | ≥ 1440px    | 大屏桌面                 |

---

## 路由规划

| 路由              | 页面           |
| ----------------- | -------------- |
| `/`               | Dashboard 总览 |
| `/funds`          | 基金列表       |
| `/funds/:code`    | 基金详情       |
| `/metals`         | 贵金属行情     |
| `/metals/:symbol` | 贵金属详情     |
| `/alerts`         | 预警管理       |
| `/settings`       | 设置           |

---

## 数据源

### 基金数据（非官方 API，通过 BFF 代理）

- 搜索：天天基金网 / 蛋卷基金
- 实时估值：`http://fundgz.1234567.com.cn/js/{code}.js`
- 历史净值：天天基金历史净值接口

### 贵金属数据

- 主源：GoldAPI.io 或 Metals-API
- 备用：Alpha Vantage
- 汇率：ExchangeRate-API

### BFF 接口

```
GET /api/metals/price?symbols=XAU,XAG,XPT
GET /api/metals/history?symbol=XAU&range=1W
GET /api/exchange-rate?from=USD&to=CNY
GET /api/funds/search?keyword=xxx
GET /api/funds/estimate?code=xxx
GET /api/funds/nav?code=xxx&page=1&size=20
```

---

## 核心计算公式

```
人民币克价 = 美元盎司价 ÷ 31.1035 × USD/CNY 汇率
当日浮盈 = 持仓金额 × 估值涨跌幅(%)
累计收益 = (当前净值 - 成本净值) × 持有份额
累计收益率 = (当前净值 ÷ 成本净值 - 1) × 100%
持仓份额(按金额) = 买入金额 ÷ 买入成本净值
```

---

## 开发里程碑

### Phase 1 — MVP（P0）

- Monorepo 脚手架搭建
- 基金搜索与添加（IndexedDB 本地存储）
- 基金列表展示（基础字段）
- 贵金属实时价格展示（黄金/白银/铂金）
- 人民币换算（含汇率）
- 涨跌展示（相较昨收/开盘）
- 预警规则设置与 Web Notification 触发
- PC 端基础布局
- 暗色主题

### Phase 2 — 增强（P1）

- 基金历史净值走势图
- 贵金属历史价格 K 线图
- 基金详情页
- 贵金属详情页（换算器）
- 移动端 H5 适配
- Dashboard 总览页
- 数据导入/导出

### Phase 3 — 打磨（P2）

- Framer Motion 动效系统
- 基金分组管理
- 离线状态处理
- 亮色主题切换
- 性能优化（代码分割、懒加载）

---

## 关键命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# Lint
pnpm lint

# 格式化
pnpm format
```

---

## 注意事项

1. **API 密钥安全：** 第三方 API 密钥严禁暴露在前端，统一通过 BFF 代理
2. **数据全本地化：** 无需用户账号体系，IndexedDB 存储一切用户数据
3. **shadcn/ui 组件：** 组件源码直接复制到 `components/ui/`，完全可控，不使用 npm 包版本
4. **无单元测试：** 本项目不编写单元测试，以手动验证为主
5. **涨跌色偏好：** 支持 green-up（A 股习惯）和 red-up（港美股习惯）两种方案
6. **预警单次触发：** 每条预警规则只触发一次通知，触发后变为"已触发"状态
7. **微信兼容：** Web Notifications API 在微信内置浏览器不可用，降级为应用内 Banner
8. **Tailwind CSS v4 native binding：** pnpm 环境下需要在根 `package.json` 的 `pnpm.onlyBuiltDependencies` 中添加 `esbuild` 和 `@tailwindcss/oxide`，并在 Windows 上显式安装 `@tailwindcss/oxide-win32-x64-msvc`
9. **shadcn/ui 初始化：** 通过 `npx shadcn@latest init` 在 `packages/app` 目录下执行，生成的 `components.json` 和 `globals.css` 需要与自定义主题 Token 合并
