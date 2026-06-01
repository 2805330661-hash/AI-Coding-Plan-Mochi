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
