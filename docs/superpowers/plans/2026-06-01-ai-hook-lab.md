# AI Hook Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that generates 10 viral-style Hook openings from a topic, platform, and content type using DeepSeek API.

**Architecture:** Next.js 16 App Router. Single page app — InputForm + HookGrid + HistoryPanel. `POST /api/generate` calls DeepSeek v4 Pro server-side only. No auth, no DB. History in localStorage.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, nanoid, DeepSeek v4 Pro API

---

## File Structure

```
ai-hook-lab/
├── .env.local                  ← LLM_API_KEY=xxx (not tracked)
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── src/
    ├── app/
    │   ├── globals.css         ← Tailwind imports + base styles
    │   ├── layout.tsx          ← metadata + HTML shell
    │   ├── page.tsx            ← main page: Header + InputForm + HookGrid + HistoryPanel
    │   └── api/
    │       └── generate/
    │           └── route.ts    ← POST handler → DeepSeek
    ├── components/
    │   ├── Header.tsx          ← fixed top bar
    │   ├── InputForm.tsx       ← topic input + platform/type pills + generate btn
    │   ├── HookCard.tsx        ← single result card
    │   ├── HookGrid.tsx        ← 2-col grid for 10 cards
    │   ├── HistoryPanel.tsx    ← slide-out drawer
    │   └── ErrorBanner.tsx     ← API key missing / error banner
    ├── hooks/
    │   ├── useGenerate.ts      ← fetch wrapper: state + fetch + error
    │   └── useHistory.ts       ← localStorage CRUD
    └── types/
        └── index.ts            ← all shared types
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `ai-hook-lab/package.json`
- Create: `ai-hook-lab/next.config.ts`
- Create: `ai-hook-lab/tsconfig.json`
- Create: `ai-hook-lab/postcss.config.mjs`
- Create: `ai-hook-lab/.gitignore`
- Create: `ai-hook-lab/.env.local`

- [ ] **Step 1: Create project directory**

```bash
mkdir -p ai-hook-lab/src/{app/api/generate,components,hooks,types}
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "ai-hook-lab",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 3: Write next.config.ts**

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  devIndicators: false,
}

export default config
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write postcss.config.mjs**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
```

- [ ] **Step 6: Write .gitignore**

```
node_modules/
.next/
.env.local
*.tsbuildinfo
```

- [ ] **Step 7: Create .env.local placeholder**

```
LLM_API_KEY=sk-your-deepseek-key-here
```

- [ ] **Step 8: Install and verify**

```bash
cd ai-hook-lab && npm install
npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -5
```

- [ ] **Step 9: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/
git commit -m "feat: scaffold ai-hook-lab with Next.js + Tailwind"
```

---

### Task 2: Types Definition

**Files:**
- Create: `ai-hook-lab/src/types/index.ts`

- [ ] **Step 1: Write types/index.ts**

```typescript
export const PLATFORMS = [
  { key: 'xiaohongshu', label: '小红书', emoji: '📕' },
  { key: 'douyin', label: '抖音', emoji: '🎵' },
  { key: 'bilibili', label: 'B站', emoji: '📺' },
  { key: 'youtube', label: 'YouTube', emoji: '▶️' },
  { key: 'x', label: 'X', emoji: '🐦' },
] as const

export const CONTENT_TYPES = [
  { key: 'video', label: '视频', emoji: '🎬' },
  { key: 'article', label: '图文', emoji: '📝' },
  { key: 'ad', label: '产品广告', emoji: '🛒' },
  { key: 'tutorial', label: '教程', emoji: '📚' },
  { key: 'opinion', label: '观点帖', emoji: '💡' },
] as const

export const HOOK_STYLES = [
  '悬念反转', '数字冲击', '情感共鸣', '痛点直击', '认知颠覆',
  '身份认同', '利益承诺', '故事开场', '提问互动', '趋势借势',
] as const

export type Platform = typeof PLATFORMS[number]['key']
export type ContentType = typeof CONTENT_TYPES[number]['key']
export type HookStyle = typeof HOOK_STYLES[number]

export interface HookResult {
  id: string
  text: string
  style: HookStyle
  clickbaitScore: number
  reason: string
}

export interface GenerateRequest {
  topic: string
  platform: Platform
  contentType: ContentType
}

export interface GenerateResponse {
  hooks?: HookResult[]
  error?: string
}

export interface HistoryRecord {
  id: string
  timestamp: number
  request: GenerateRequest
  hooks: HookResult[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ai-hook-lab && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/types/
git commit -m "feat: add types for ai-hook-lab"
```

---

### Task 3: API Route — POST /api/generate

**Files:**
- Create: `ai-hook-lab/src/app/api/generate/route.ts`

- [ ] **Step 1: Write route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { HookResult, HookStyle } from '@/types'
import { HOOK_STYLES } from '@/types'

const PLATFORM_GUIDES: Record<string, string> = {
  xiaohongshu: '小红书平台：种草语气、emoji友好、女性用户居多，常用"姐妹们""谁懂啊"开头，亲切分享感',
  douyin: '抖音平台：黄金3秒法则、快节奏、口语化、强冲突或强反差，抓住注意力',
  bilibili: 'B站平台：弹幕文化、玩梗多、Z世代语言，常用"卧槽""离谱""绝了"等口头禅',
  youtube: 'YouTube平台：信息密度高、中长视频教程感，"你一定不知道""99%的人都没发现"',
  x: 'X/Twitter平台：极简有力、观点鲜明、140字内的信息炸弹，适合中英文混搭',
}

const TYPE_GUIDES: Record<string, string> = {
  video: '内容形式为视频。Hook需要制造视觉期待，引导观众看完。',
  article: '内容形式为图文笔记。Hook需要结合封面图让人停下来阅读。',
  ad: '内容形式为产品广告。Hook需要突出产品卖点与用户痛点的关联。',
  tutorial: '内容形式为教程。Hook需要暗示学会后的收益或揭露常见错误。',
  opinion: '内容形式为观点帖。Hook需要鲜明立场，激发讨论和转发。',
}

function buildSystemPrompt(platform: string, contentType: string): string {
  return `你是一位资深爆款文案专家，精通各内容平台的算法和用户心理。

${PLATFORM_GUIDES[platform]}
${TYPE_GUIDES[contentType]}

请为给定主题生成10个不同风格的Hook开头文案。

必须覆盖以下10种风格，每种恰好1条：
1. 悬念反转 — 先设预期再推翻，制造意外
2. 数字冲击 — 用具体数字制造信息差和好奇心
3. 情感共鸣 — 说出用户内心感受，让人点头认同
4. 痛点直击 — 点出常见困扰，给出解决暗示
5. 认知颠覆 — 挑战固有认知，让人想一探究竟
6. 身份认同 — 标签化特定人群，制造归属感
7. 利益承诺 — 明确告诉用户看了能获得什么
8. 故事开场 — 用微型叙事或对话开场
9. 提问互动 — 用问题勾起好奇或引发讨论
10. 趋势借势 — 结合当前热门话题或趋势

每条Hook要求：
- 15-40个中文字符
- 风格标签必须是上述10种之一
- clickbaitScore为1-10的整数（代表点击欲望强度）
- reason为一句简短推荐理由（15字以内）

返回严格JSON格式，只返回JSON，不要任何其他文字：
{
  "hooks": [
    { "text": "具体hook文案", "style": "悬念反转", "clickbaitScore": 9, "reason": "反转制造强烈好奇" },
    ...
  ]
}`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API_KEY_MISSING', message: '请在 .env.local 中设置 LLM_API_KEY=sk-xxx' },
      { status: 500 }
    )
  }

  let body: { topic?: string; platform?: string; contentType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: '请求格式错误' }, { status: 400 })
  }

  const { topic, platform, contentType } = body
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return NextResponse.json({ error: 'MISSING_TOPIC', message: '请输入主题' }, { status: 400 })
  }
  if (!platform || !PLATFORM_GUIDES[platform]) {
    return NextResponse.json({ error: 'INVALID_PLATFORM', message: '请选择有效平台' }, { status: 400 })
  }
  if (!contentType || !TYPE_GUIDES[contentType]) {
    return NextResponse.json({ error: 'INVALID_TYPE', message: '请选择有效内容类型' }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt(platform, contentType)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        temperature: 1.0,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `主题：${topic.trim()}` },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: 'API_ERROR', message: `模型返回错误 (${response.status})，请稍后重试` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'EMPTY_RESPONSE', message: '模型未返回内容，请重试' },
        { status: 500 }
      )
    }

    let parsed: { hooks?: HookResult[] }
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: '模型返回格式异常，请重试' },
        { status: 500 }
      )
    }

    if (!Array.isArray(parsed.hooks) || parsed.hooks.length === 0) {
      return NextResponse.json(
        { error: 'NO_HOOKS', message: '未能生成有效 Hook，请换个主题试试' },
        { status: 500 }
      )
    }

    const hooks: HookResult[] = parsed.hooks.map((h: Partial<HookResult>, i: number) => ({
      id: `hook-${Date.now()}-${i}`,
      text: typeof h.text === 'string' ? h.text.slice(0, 80) : '',
      style: HOOK_STYLES.includes(h.style as HookStyle) ? h.style : '悬念反转',
      clickbaitScore: typeof h.clickbaitScore === 'number'
        ? Math.max(1, Math.min(10, Math.round(h.clickbaitScore)))
        : 5,
      reason: typeof h.reason === 'string' ? h.reason.slice(0, 40) : '值得一试的Hook',
    }))

    return NextResponse.json({ hooks })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'TIMEOUT', message: '生成超时，请减少内容后重试' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'NETWORK_ERROR', message: '网络错误，请检查网络后重试' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ai-hook-lab && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/app/api/
git commit -m "feat: add /api/generate route with DeepSeek integration"
```

---

### Task 4: useGenerate Hook

**Files:**
- Create: `ai-hook-lab/src/hooks/useGenerate.ts`

- [ ] **Step 1: Write useGenerate.ts**

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { HookResult, Platform, ContentType, GenerateResponse } from '@/types'

interface UseGenerateReturn {
  hooks: HookResult[]
  loading: boolean
  error: string | null
  generate: (topic: string, platform: Platform, contentType: ContentType) => Promise<void>
  reset: () => void
}

export function useGenerate(): UseGenerateReturn {
  const [hooks, setHooks] = useState<HookResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (topic: string, platform: Platform, contentType: ContentType) => {
    setLoading(true)
    setError(null)
    setHooks([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, contentType }),
      })

      const data: GenerateResponse = await res.json()

      if (!res.ok || data.error) {
        setError(data.message || '生成失败，请稍后重试')
        return
      }

      if (data.hooks && data.hooks.length > 0) {
        setHooks(data.hooks)
      } else {
        setError('未能生成有效结果，请换个主题试试')
      }
    } catch {
      setError('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setHooks([])
    setError(null)
  }, [])

  return { hooks, loading, error, generate, reset }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/hooks/useGenerate.ts
git commit -m "feat: add useGenerate hook for API calls"
```

---

### Task 5: useHistory Hook

**Files:**
- Create: `ai-hook-lab/src/hooks/useHistory.ts`

- [ ] **Step 1: Write useHistory.ts**

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { HistoryRecord, GenerateRequest, HookResult } from '@/types'

const STORAGE_KEY = 'ai-hook-lab-history'
const MAX_RECORDS = 50

function loadRecords(): HistoryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveRecords(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

interface UseHistoryReturn {
  records: HistoryRecord[]
  addRecord: (request: GenerateRequest, hooks: HookResult[]) => void
  deleteRecord: (id: string) => void
  clearAll: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

export function useHistory(): UseHistoryReturn {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setRecords(loadRecords())
  }, [])

  const addRecord = useCallback((request: GenerateRequest, hooks: HookResult[]) => {
    setRecords(prev => {
      const next = [
        { id: `hist-${Date.now()}`, timestamp: Date.now(), request, hooks },
        ...prev,
      ].slice(0, MAX_RECORDS)
      saveRecords(next)
      return next
    })
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id)
      saveRecords(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setRecords([])
    saveRecords([])
  }, [])

  return { records, addRecord, deleteRecord, clearAll, open, setOpen }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/hooks/useHistory.ts
git commit -m "feat: add useHistory hook for localStorage"
```

---

### Task 6: Header Component

**Files:**
- Create: `ai-hook-lab/src/components/Header.tsx`

- [ ] **Step 1: Write Header.tsx**

```typescript
'use client'

interface HeaderProps {
  onOpenHistory: () => void
}

export function Header({ onOpenHistory }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#08080D]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🪝</span>
          <span className="bg-gradient-to-r from-[#7C5CFC] to-[#5CE0D8] bg-clip-text text-lg font-bold text-transparent">
            AI Hook Lab
          </span>
        </div>
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-[#8888A0] transition-colors hover:border-white/[0.15] hover:text-[#EDEDF0]"
        >
          📋 历史
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/Header.tsx
git commit -m "feat: add Header component"
```

---

### Task 7: ErrorBanner Component

**Files:**
- Create: `ai-hook-lab/src/components/ErrorBanner.tsx`

- [ ] **Step 1: Write ErrorBanner.tsx**

```typescript
'use client'

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null

  const isApiKeyMissing = message.includes('LLM_API_KEY')

  return (
    <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-[#FF4D6A]/20 bg-[#FF4D6A]/8 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-sm">⚠️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#FF4D6A]">{message}</p>
          {isApiKeyMissing && (
            <p className="mt-1.5 text-xs text-[#8888A0]">
              创建文件 <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[#5CE0D8]">ai-hook-lab/.env.local</code>，
              写入 <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[#5CE0D8]">LLM_API_KEY=sk-your-key-here</code>
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-sm text-[#8888A0] transition-colors hover:text-[#EDEDF0]"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/ErrorBanner.tsx
git commit -m "feat: add ErrorBanner component"
```

---

### Task 8: InputForm Component

**Files:**
- Create: `ai-hook-lab/src/components/InputForm.tsx`

- [ ] **Step 1: Write InputForm.tsx**

```typescript
'use client'

import { useState } from 'react'
import { PLATFORMS, CONTENT_TYPES, type Platform, type ContentType } from '@/types'

interface InputFormProps {
  onGenerate: (topic: string, platform: Platform, contentType: ContentType) => void
  loading: boolean
  disabled: boolean
}

export function InputForm({ onGenerate, loading, disabled }: InputFormProps) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<Platform>('xiaohongshu')
  const [contentType, setContentType] = useState<ContentType>('video')

  const canSubmit = topic.trim().length > 0 && !loading

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onGenerate(topic.trim(), platform, contentType)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
      {/* Topic Input */}
      <div>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="输入你的内容主题，比如：打工人如何做副业..."
          disabled={disabled}
          className="w-full rounded-xl border border-white/[0.08] bg-[#12121A] px-4 py-3.5 text-[15px] text-[#EDEDF0] placeholder-[#8888A0]/60 outline-none transition-colors focus:border-[#7C5CFC]/40 focus:ring-1 focus:ring-[#7C5CFC]/20 disabled:opacity-50"
        />
      </div>

      {/* Platform Pills */}
      <div>
        <p className="mb-2 text-xs font-medium text-[#8888A0]">选择平台</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p.key}
              type="button"
              disabled={disabled}
              onClick={() => setPlatform(p.key)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                platform === p.key
                  ? 'border-[#7C5CFC]/40 bg-[#7C5CFC]/12 text-[#7C5CFC]'
                  : 'border-white/[0.06] bg-[#12121A] text-[#8888A0] hover:border-white/[0.12] hover:text-[#EDEDF0]'
              } disabled:opacity-50`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type Pills */}
      <div>
        <p className="mb-2 text-xs font-medium text-[#8888A0]">内容类型</p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(t => (
            <button
              key={t.key}
              type="button"
              disabled={disabled}
              onClick={() => setContentType(t.key)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                contentType === t.key
                  ? 'border-[#7C5CFC]/40 bg-[#7C5CFC]/12 text-[#7C5CFC]'
                  : 'border-white/[0.06] bg-[#12121A] text-[#8888A0] hover:border-white/[0.12] hover:text-[#EDEDF0]'
              } disabled:opacity-50`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-all ${
          canSubmit
            ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5CE0D8] shadow-lg shadow-[#7C5CFC]/20 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#7C5CFC]/30 active:scale-[0.99]'
            : 'cursor-not-allowed bg-[#1A1A26] text-[#8888A0]'
        } ${loading ? 'animate-pulse' : ''}`}
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            🪝 正在生成 Hook...
          </>
        ) : (
          <>
            ⚡ 生成 10 个 Hook
          </>
        )}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/InputForm.tsx
git commit -m "feat: add InputForm component with platform/type pills"
```

---

### Task 9: HookCard Component

**Files:**
- Create: `ai-hook-lab/src/components/HookCard.tsx`

- [ ] **Step 1: Write HookCard.tsx**

```typescript
'use client'

import { useState } from 'react'
import type { HookResult } from '@/types'

interface HookCardProps {
  hook: HookResult
  index: number
}

const SCORE_COLORS: Record<number, string> = {
  10: 'bg-[#5CE0D8]',
  9: 'bg-[#5CE0D8]/90',
  8: 'bg-[#34D399]',
  7: 'bg-[#34D399]/80',
  6: 'bg-[#FBBF24]',
  5: 'bg-[#FBBF24]/70',
  4: 'bg-[#FB923C]',
  3: 'bg-[#FB923C]/70',
  2: 'bg-[#FF4D6A]',
  1: 'bg-[#FF4D6A]/70',
}

function ScoreBar({ score }: { score: number }) {
  const color = SCORE_COLORS[score] || 'bg-[#8888A0]'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${score >= 7 ? 'text-[#34D399]' : score >= 4 ? 'text-[#FBBF24]' : 'text-[#FF4D6A]'}`}>
        {score}/10
      </span>
    </div>
  )
}

export function HookCard({ hook, index }: HookCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hook.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-[#12121A] p-5 transition-all hover:-translate-y-1 hover:border-[#7C5CFC]/20 hover:shadow-lg hover:shadow-[#7C5CFC]/5">
      {/* Style Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[#7C5CFC]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#7C5CFC]">
          {hook.style}
        </span>
        <span className="text-[11px] text-[#8888A0]">#{index + 1}</span>
      </div>

      {/* Hook Text */}
      <p className="mb-4 text-[16px] leading-relaxed text-[#EDEDF0]">
        {hook.text}
      </p>

      {/* Reason */}
      <p className="mb-4 text-[13px] text-[#8888A0]">
        💬 {hook.reason}
      </p>

      {/* Bottom Row */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
        <ScoreBar score={hook.clickbaitScore} />

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              copied
                ? 'bg-[#34D399]/10 text-[#34D399]'
                : 'text-[#8888A0] hover:bg-white/[0.04] hover:text-[#EDEDF0]'
            }`}
          >
            {copied ? '✅ 已复制' : '📋 复制'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/HookCard.tsx
git commit -m "feat: add HookCard component with score bar and copy"
```

---

### Task 10: HookGrid Component

**Files:**
- Create: `ai-hook-lab/src/components/HookGrid.tsx`

- [ ] **Step 1: Write HookGrid.tsx**

```typescript
'use client'

import type { HookResult } from '@/types'
import { HookCard } from './HookCard'

interface HookGridProps {
  hooks: HookResult[]
}

export function HookGrid({ hooks }: HookGridProps) {
  if (hooks.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#EDEDF0]">
        ✨ {hooks.length} 个 Hook
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {hooks.map((hook, i) => (
          <HookCard key={hook.id} hook={hook} index={i} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/HookGrid.tsx
git commit -m "feat: add HookGrid with 2-column responsive layout"
```

---

### Task 11: HistoryPanel Component

**Files:**
- Create: `ai-hook-lab/src/components/HistoryPanel.tsx`

- [ ] **Step 1: Write HistoryPanel.tsx**

```typescript
'use client'

import { useState } from 'react'
import type { HistoryRecord } from '@/types'
import { PLATFORMS, CONTENT_TYPES } from '@/types'

interface HistoryPanelProps {
  records: HistoryRecord[]
  open: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} 小时前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getPlatformLabel(key: string): string {
  const p = PLATFORMS.find(p => p.key === key)
  return p ? `${p.emoji} ${p.label}` : key
}

function getTypeLabel(key: string): string {
  const t = CONTENT_TYPES.find(t => t.key === key)
  return t ? `${t.emoji} ${t.label}` : key
}

export function HistoryPanel({ records, open, onClose, onDelete, onClearAll }: HistoryPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-[#0A0A12] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-bold text-[#EDEDF0]">📋 历史记录</h2>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={onClearAll}
                className="rounded-lg px-2.5 py-1 text-xs text-[#FF4D6A] transition-colors hover:bg-[#FF4D6A]/8"
              >
                清空全部
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-[#8888A0] transition-colors hover:text-[#EDEDF0]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <span className="mb-3 text-3xl">📭</span>
              <p className="text-sm text-[#8888A0]">还没有历史记录</p>
              <p className="mt-1 text-xs text-[#8888A0]/60">生成 Hook 后会自动保存在这里</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {records.map(record => {
                const isExpanded = expanded === record.id
                return (
                  <div key={record.id}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : record.id)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#EDEDF0]">
                          {record.request.topic}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-[#8888A0]">
                          <span>{getPlatformLabel(record.request.platform)}</span>
                          <span>·</span>
                          <span>{getTypeLabel(record.request.contentType)}</span>
                          <span>·</span>
                          <span>{formatTime(record.timestamp)}</span>
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 text-xs text-[#8888A0]">
                        {isExpanded ? '收起' : '展开'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/[0.04] px-5 py-4">
                        <div className="space-y-2">
                          {record.hooks.map((hook, i) => (
                            <div
                              key={hook.id || i}
                              className="rounded-lg bg-white/[0.02] px-3 py-2.5"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] text-[#7C5CFC]">{hook.style}</span>
                                <span className="text-[11px] text-[#FBBF24]">★ {hook.clickbaitScore}</span>
                              </div>
                              <p className="text-[13px] text-[#EDEDF0] leading-relaxed">{hook.text}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => onDelete(record.id)}
                          className="mt-3 text-xs text-[#FF4D6A] transition-colors hover:underline"
                        >
                          🗑 删除此记录
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/components/HistoryPanel.tsx
git commit -m "feat: add HistoryPanel with slide-out drawer"
```

---

### Task 12: Root Layout & Global Styles

**Files:**
- Create: `ai-hook-lab/src/app/globals.css`
- Create: `ai-hook-lab/src/app/layout.tsx`

- [ ] **Step 1: Write globals.css**

```css
@import "tailwindcss";

html {
  color-scheme: dark;
}

body {
  background: #08080D;
  color: #EDEDF0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: Write layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Hook Lab — 爆款 Hook 生成器',
  description: '输入主题，选择平台和内容类型，AI 一次生成 10 个不同风格的爆款开头 Hook。',
  openGraph: {
    title: 'AI Hook Lab — 爆款 Hook 生成器',
    description: '输入主题，一次生成 10 个爆款 Hook 开头。',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/app/globals.css ai-hook-lab/src/app/layout.tsx
git commit -m "feat: add root layout and global styles"
```

---

### Task 13: Main Page — Compose Everything

**Files:**
- Create: `ai-hook-lab/src/app/page.tsx`

- [ ] **Step 1: Write page.tsx**

```typescript
'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Header } from '@/components/Header'
import { InputForm } from '@/components/InputForm'
import { HookGrid } from '@/components/HookGrid'
import { HistoryPanel } from '@/components/HistoryPanel'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useGenerate } from '@/hooks/useGenerate'
import { useHistory } from '@/hooks/useHistory'
import type { Platform, ContentType } from '@/types'

export default function HomePage() {
  const { hooks, loading, error, generate, reset } = useGenerate()
  const { records, addRecord, deleteRecord, clearAll, open, setOpen } = useHistory()

  // Track the last request to save after hooks arrive
  const pendingRequest = useRef<{ topic: string; platform: Platform; contentType: ContentType } | null>(null)

  const handleGenerate = useCallback(
    async (topic: string, platform: Platform, contentType: ContentType) => {
      reset()
      pendingRequest.current = { topic, platform, contentType }
      await generate(topic, platform, contentType)
    },
    [generate, reset]
  )

  // When hooks arrive, save to history
  useEffect(() => {
    if (hooks.length > 0 && pendingRequest.current) {
      addRecord(pendingRequest.current, hooks)
      pendingRequest.current = null
    }
  }, [hooks, addRecord])

  return (
    <div className="min-h-screen bg-[#08080D]">
      <Header onOpenHistory={() => setOpen(true)} />

      <main className="px-4 pb-20 pt-20">
        {/* Error */}
        {error && (
          <ErrorBanner message={error} onDismiss={reset} />
        )}

        {/* Input Form */}
        <div className={hooks.length > 0 ? 'mb-10' : 'mt-12'}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#EDEDF0] md:text-3xl">
              爆款<span className="bg-gradient-to-r from-[#7C5CFC] to-[#5CE0D8] bg-clip-text text-transparent"> Hook</span> 生成器
            </h1>
            <p className="mt-2 text-sm text-[#8888A0]">
              输入主题，AI 一次生成 10 个不同风格的爆款开头
            </p>
          </div>
          <InputForm onGenerate={handleGenerate} loading={loading} disabled={false} />
        </div>

        {/* Results */}
        <HookGrid hooks={hooks} />
      </main>

      {/* History Panel */}
      <HistoryPanel
        records={records}
        open={open}
        onClose={() => setOpen(false)}
        onDelete={deleteRecord}
        onClearAll={clearAll}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ai-hook-lab && npx tsc --noEmit
```

- [ ] **Step 3: Verify build**

```bash
cd ai-hook-lab && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd /Users/wuxiang/AI\ Coding\ Plan
git add ai-hook-lab/src/app/page.tsx
git commit -m "feat: compose main page with all components"
```

---

## Self-Review Checklist

- [x] **Spec coverage** — Every spec requirement has a task: types (T2), API route (T3), hooks (T4, T5), all 6 components (T6-T11), page composition (T13), styles (T12)
- [x] **Placeholder scan** — No TBD, TODO, or vague steps
- [x] **Type consistency** — `HookResult`, `GenerateRequest`, `Platform`, `ContentType` defined in T2, used consistently in T3-T13
- [x] **Complete code** — Every code step has full implementation, not references
- [x] **Exact paths** — All file paths are absolute from repo root
