# AI Hook Lab — 设计规格说明

> 2026-06-01 · brainstorming 产出 · 待实现

## 概述

**定位**：AI 文案网页 App，帮助内容创作者一键生成 10 个不同风格的爆款 Hook 开头。

**技术栈**：Next.js 16 + TypeScript 5 + Tailwind CSS 4，DeepSeek v4 Pro API。

**一句话价值**：输入主题 → 选平台/类型 → 10 个风格各异的 Hook，直接复制使用。

---

## 一、项目位置

`/ai-hook-lab/`，同仓库子目录。与 `ai-news-2026-06-01.html` 等共用 Git 仓库。

---

## 二、目录结构

```
ai-hook-lab/
├── .env.local              ← LLM_API_KEY（gitignore）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx      ← 根布局（metadata + 全局样式）
    │   ├── page.tsx        ← 主页面（组合所有组件）
    │   └── api/
    │       └── generate/
    │           └── route.ts ← POST，服务端调用 DeepSeek
    ├── components/
    │   ├── Header.tsx       ← Logo + 历史按钮
    │   ├── InputForm.tsx    ← 输入 + 选择 + 生成按钮
    │   ├── HookCard.tsx     ← 单张结果卡片
    │   ├── HookGrid.tsx     ← 10 张卡片网格
    │   ├── HistoryPanel.tsx ← 历史侧边抽屉
    │   └── ErrorBanner.tsx  ← API Key 缺失提示
    ├── hooks/
    │   ├── useGenerate.ts   ← API 调用 + loading/error
    │   └── useHistory.ts    ← localStorage 读写
    └── types/
        └── index.ts         ← 所有类型定义
```

---

## 三、类型定义

```typescript
type Platform = 'xiaohongshu' | 'douyin' | 'bilibili' | 'youtube' | 'x'
type ContentType = 'video' | 'article' | 'ad' | 'tutorial' | 'opinion'

interface HookResult {
  id: string            // nanoid
  text: string          // 15-40 字
  style: string         // 10 种风格标签之一
  clickbaitScore: number // 1-10
  reason: string        // 推荐理由
}

interface GenerateRequest {
  topic: string
  platform: Platform
  contentType: ContentType
}

interface GenerateResponse {
  hooks: HookResult[]
  error?: string
}

interface HistoryRecord {
  id: string
  timestamp: number
  request: GenerateRequest
  hooks: HookResult[]
}
```

### 10 种 Hook 风格标签

1. 悬念反转 — "我以为…结果…"
2. 数字冲击 — "3 个方法让…翻了 10 倍"
3. 情感共鸣 — "每个打工人都懂…"
4. 痛点直击 — "别再…了，试试这个"
5. 认知颠覆 — "你以为的…其实是错的"
6. 身份认同 — "内向的人最适合…"
7. 利益承诺 — "学会这个，轻松涨粉 1 万"
8. 故事开场 — "昨天有个客户跟我说…"
9. 提问互动 — "为什么你的…总是不行？"
10. 趋势借势 — "2026 年最火的…"

### 平台 & 内容类型

**平台**：小红书、抖音、B站、YouTube、X（Twitter）

**内容类型**：视频、图文、产品广告、教程、观点帖

---

## 四、架构 & 数据流

### 核心流程

```
用户输入 topic + platform + contentType
        │
        ▼
  useGenerate hook ── POST /api/generate ── DeepSeek v4 Pro
        │                    │
        │              process.env.LLM_API_KEY（仅服务端）
        │                    │
        │              Prompt → 10 条 JSON
        │                    │
        ▼                    ▼
  HookResult[] ──────────→ HookGrid 渲染
        │
        ▼
  useHistory 自动存入 localStorage
```

### API Route：`POST /api/generate`

- **方案**：单次请求生成 10 条 Hook（非并行）
- **模型**：`deepseek-v4-pro`，temperature 1.0
- **输出格式**：`response_format: { type: "json_object" }`

#### Prompt 结构

System Prompt 包含：
- 平台特征描述（小红书种草语气、抖音黄金3秒、B站弹幕文化、YouTube信息密度、X极简观点）
- 内容类型特征（视频/图文/广告/教程/观点各自的语气要求）
- 10 种风格的明确列表和各自示例
- 严格 JSON 输出指令

#### 异常处理

| 情况 | HTTP | 前端表现 |
|------|------|---------|
| API Key 未配置 | 500 | ErrorBanner：「请在 .env.local 中设置 LLM_API_KEY=xxx」 |
| 请求参数缺失 | 400 | ErrorBanner：提示补全信息 |
| DeepSeek 返回异常 | 500 | ErrorBanner：「生成失败，请稍后重试」|
| JSON 解析失败 | 500 | 降级：正则提取，尽最大努力展示 |
| 返回不足 10 条 | 200 | 有几条显示几条，不补齐 |
| 网络超时（>30s） | 504 | 「生成超时，请减少内容后重试」 |

### 安全边界

- `LLM_API_KEY` 只在 `route.ts` 服务端通过 `process.env` 读取
- 前端无法访问 `.env.local`，API key 不会出现在任何客户端 bundle 中
- `.env.local` 加入 `.gitignore`

---

## 五、UI 设计系统

### 配色

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景 | `#08080D` | 深黑紫底 |
| 卡片 | `#12121A` | 微亮卡片 |
| 卡片悬浮 | `#1A1A26` | hover 态 |
| 文字主色 | `#EDEDF0` | 柔和白 |
| 文字辅色 | `#8888A0` | 中灰 |
| 强调色 | `#7C5CFC` | 紫罗兰（选中、评分） |
| 强调渐变 | `#7C5CFC → #5CE0D8` | 紫→青（主按钮） |
| 错误 | `#FF4D6A` | 红 |
| 成功 | `#34D399` | 绿 |

### 组件规格

| 组件 | 要点 |
|------|------|
| **Header** | 左 Logo「AI Hook Lab」+ 右「📋 历史」、固定顶部、`backdrop-blur` |
| **InputForm** | 大号输入框（placeholder 打字机动画）、5 个平台 pill、5 个类型 pill、生成按钮渐变色全宽 |
| **HookCard** | 圆角 14px、border `#1E1E30`、hover 上浮 4px + 渐变 border、顶部风格徽章、中间 16px 文案、底部评分 + 复制/收藏按钮 |
| **HookGrid** | 桌面 2 列、手机 1 列、gap 16px、section title「✨ 10 个 Hook」 |
| **HistoryPanel** | 右侧滑出 500px 抽屉、列表显示时间/主题/平台、可展开看详情、可删除单条 |
| **ErrorBanner** | 红色半透明条、显示错误 + 解决指引 |

### 移动端适配

| 桌面 ≥768px | 手机 <768px |
|-------------|-------------|
| HookCard 2 列 | 单列 |
| 平台/类型 pill 横排 | 换行排列 |
| 输入框 640px 宽 | 全宽 |
| 历史面板 500px 抽屉 | 全屏底部 Sheet |

### 生成体验

- 点击生成 → 按钮变灰 + 脉冲动画 + 文字「🪝 正在生成 Hook...」
- 一次返回全部 10 条卡片（非逐条流式出现）
- Loading 时间预期 3-5 秒

---

## 六、历史记录（localStorage）

- Key：`ai-hook-lab-history`
- 结构：`HistoryRecord[]`
- 上限：50 条（超过则删除最旧的）
- 操作：查看列表、展开详情、删除单条、清空全部
- 生成成功后**自动保存**

---

## 七、依赖清单

```json
{
  "next": "^16",
  "react": "^19",
  "tailwindcss": "^4",
  "typescript": "^5",
  "nanoid": "^5"
}
```

零额外 UI 库。纯 Tailwind CSS 手写样式。

---

## 八、不做的（明确边界）

- ❌ 登录/注册
- ❌ 数据库 / 后端持久化
- ❌ API Key 暴露到前端
- ❌ 批量生成超过 10 条
- ❌ 导出图片 / PDF
- ❌ 多语言（只做中文）

---

## 九、决策记录

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 项目位置 | 当前仓库子目录 | 共用 Git 仓库，方便管理 |
| 大模型 | DeepSeek v4 Pro | 已有 API key，文案能力强 |
| 生成策略 | 单次请求 10 条 | 成本可控、实现简单、pro 能力足够 |
| 风格标签 | 10 种固定风格 | 覆盖主流爆款文案范式 |
| 生成方式 | 一次性返回全部 | 用户偏好直接出结果 |
| 讨论方式 | 纯文字 | 用户不需要可视化辅助 |
