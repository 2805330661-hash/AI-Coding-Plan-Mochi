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
  message?: string
}

export interface HistoryRecord {
  id: string
  timestamp: number
  request: GenerateRequest
  hooks: HookResult[]
}
