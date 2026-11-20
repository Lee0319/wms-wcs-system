# WMS-WCS 智能仓储集成系统

按 shadcn/ui 设计规范，用 React 优化PC主界面。

## 快速运行

```bash
cd wms-wcs-clone
npm install          # 已安装可跳过
npm run dev          # 开发模式，访问 http://localhost:5180
npm run build        # 生产构建到 dist/
npm run preview      # 预览构建产物
```

## 部署上线（无需本地运行）

本项目是纯前端静态站（默认使用 Mock 数据，无需后端），可直接托管到任意静态托管平台。

### 方式一：Vercel（推荐，最简单）

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点 **Add New → Project**，选择 `wms-wcs-system` 仓库
3. 框架会自动识别为 **Vite**，无需改配置（Build: `npm run build`，Output: `dist`）
4. 点 **Deploy**，约 1 分钟拿到 `https://xxx.vercel.app` 地址

之后每次 `git push` 都会自动重新部署。

### 方式二：Cloudflare Pages（国内访问更快）

1. 打开 [pages.cloudflare.com](https://pages.cloudflare.com)，用 GitHub 登录
2. **Create a project → Connect to Git**，选择本仓库
3. 构建配置：Framework preset 选 **Vite**，Build command `npm run build`，Output directory `dist`
4. 保存部署，得到 `https://xxx.pages.dev` 地址

### 方式三：GitHub Pages

需将仓库设为 Public（或使用 GitHub Pro），并在 **Settings → Pages** 选择 GitHub Actions 部署。

> 说明：项目使用 `HashRouter`，路由在 `#` 后，静态托管无需配置 SPA 重写规则。

## 演示账号

| 账号 | 密码 | 角色 | 权限范围 |
|---|---|---|---|
| `admin` | 任意 | 管理员 | 全部 32 功能 |
| `wangqiang` | 任意 | 入库操作员 | 查看 / 入库上架 / 基础数据 |
| `lina` | 任意 | 拣选员 | 查看 / 波次拣选 |
| `zhangwei` | 任意 | WCS 监控员 | 查看 / WCS 监控 |

登录页已预填 `admin / 123456`，直接点登录即可。

## 数据源切换

数据源由 `.env` 中的一个开关控制：

```env
VITE_USE_MOCK=true                        # 本地 Mock（默认，无需后端）
VITE_API_BASE=http://localhost:3001       # 真实后端地址（按需替换为你的服务）
```

- `VITE_USE_MOCK=true`：使用内存 Mock 数据库，所有 CRUD 与业务动作（上架/分配/拣选/呼叫/移库）均可演示。
- `VITE_USE_MOCK=false`：切换到真实后端 `/api/*`（需要有效账号）。所有接口收敛在 `src/api/adapter.ts`，页面代码无需改动。

## 侧栏样式切换

顶栏通知图标左侧的**设置图标**可打开设置抽屉，切换左侧导航栏的 3 种 shadcn Sidebar 变体：

| 变体 | 外观 |
|---|---|
| 贴边 sidebar | 侧栏贴边，浅灰底 + 右侧边框分隔 |
| 浮动 floating | 侧栏留白、圆角、边框与阴影，像悬浮卡片 |
| 内嵌 inset | 页面浅灰底，内容区为白色圆角卡片（默认） |

选择即时生效并保存到 `localStorage`（键 `wms_sidebar_variant`），刷新后保持。实现见 `src/store/sidebar-mode.ts` 与 `src/components/shared/SettingsSheet.tsx`。

## 亮/暗主题切换

顶部导航栏**通知图标左侧**有主题切换按钮（太阳/月亮，Remix Icon）。点击即可在浅色 / 暗色间切换：

- 主题状态由 `src/store/theme.ts` 管理，持久化到 `localStorage`（键 `wms_theme`），刷新后保持。
- 首次访问跟随系统 `prefers-color-scheme`。
- 亮/暗两套令牌均在 `src/index.css` 的 `:root` / `.dark` 中定义，全站组件与图表自动适配。

## 已实现功能（8 分组 32 项）

- **我的工作台**：综合驾驶舱（Recharts 图表 / 统计卡 / 库区水位）、库存查询、组盘管理、出入库记录
- **入库与库存**：收货与上架（4 步扫码流程）、库存与批次台账、料箱库上架（直接/呼叫/组托三种模式）
- **库内作业**：巷道监控（左进右出可视化）、出库订单与分配、波次拣选（货位/批次扫码校验）、托盘呼叫、托盘区域管理、托盘移库、**库位图布局器**（可拖拽绘制的网格 + AGV 通道画笔）
- **WCS 与配置**：设备与任务监控、规则与策略配置（开关）、策略说明
- **权限管理**：用户管理（账号/角色双 Tab）
- **基础数据**：物料、业务伙伴、库区、巷道、货位、联动组、托盘区域、出口配置、托盘（9 项完整 CRUD + 搜索 + 分页 + Excel 导出）
- **系统查看**：数据管理、日志查看（级别过滤）、回收站（恢复操作）
- **设计开发**：数据库表设计（表结构浏览）、窗体界面设计、数据字典（原系统标注"规划中"）

## 技术栈

React 18 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui（Radix） · React Router · TanStack Query/Table · Zustand · Recharts · **Remix Icon** · xlsx · sonner

> 图标库使用 Remix Icon（`@remixicon/react`）。所有图标统一从 `src/lib/icons.ts` 导出，业务侧图标名保持不变，如需调整某个图标只需改这一处映射。`lucide-react` 已完全移除。

## shadcn/ui 规范符合度

本项目严格遵循 shadcn/ui 规范：

- **设计令牌**：`src/index.css` 使用 shadcn 官方全套 CSS 变量（`--background`、`--primary`、`--border`、`--chart-1~5`、`--sidebar-*` 等），含亮/暗双主题。当前主题为 shadcn/create 生成的 preset（slate 中性底 + 蓝主色 `#1447E6`），已从 OKLCH 等价转换为本项目 Tailwind v3 所需的 HSL 格式。圆角 `--radius: 0.625rem`。
- **零硬编码颜色**：全站无 `bg-blue-500` 这类调色板类、无 `#xxxxxx` 十六进制色值；图表色使用 `hsl(var(--chart-N))`，状态色使用扩展的 `--success/--warning/--info` 语义令牌。
- **组件体系**：18 个 shadcn 组件位于 `src/components/ui/`（基于 Radix primitives + cva 变体）。业务表单全部使用 shadcn 的 `Input`/`Textarea`/`Select`/`Checkbox`/`Switch`，无原生 HTML 表单元素。
- **导航框架**：使用 shadcn 官方 `Sidebar` 组件（`src/components/ui/sidebar.tsx`），采用 **inset 变体**——侧栏与主内容区均为浮起的圆角面板（`Sidebar variant="inset"` + `SidebarInset`）；支持 `collapsible="icon"` 折叠为图标栏、快捷键 `Cmd/Ctrl+B`、移动端用 `Sheet` 抽屉。菜单用 `SidebarMenu`/`SidebarMenuButton` 等语义组件并保留权限过滤。
- **Remix Icon**：图标全部来自 Remix Icon，与 shadcn 无冲突（shadcn 不绑定特定图标库）。

## 目录结构

```
src/
├── api/adapter.ts        # 数据源适配层（Mock ⇄ 真实后端）
├── config/menu.ts        # 8 分组 32 功能菜单 + 权限码
├── mock/data.ts          # 仓储业务 Mock 数据库
├── store/auth.ts         # 登录态与权限
├── lib/icons.ts          # 统一图标出口（Remix Icon 映射）
├── components/
│   ├── ui/               # shadcn 基础组件
│   ├── layout/           # AppShell（侧栏/顶栏/面包屑）
│   └── shared/           # CrudTable / PageHeader / StatCard / StatusBadge
└── pages/                # 按业务分组的功能页面
```

## 与原系统的对齐说明

- 菜单树、权限码、页面标题、字段名、提示文案均从原系统前端 bundle 中提取，保持对齐。
- 原系统是 Vue 3 + uni-app；本复刻按约定改用 React + shadcn/ui，属于同信息架构下的技术栈重写。
- 移动端 4 个作业页按需求约定不在本次复刻范围内。
- 部分高级功能（数据字典）在原系统即为"规划中"状态，此处保留该状态展示。
