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
