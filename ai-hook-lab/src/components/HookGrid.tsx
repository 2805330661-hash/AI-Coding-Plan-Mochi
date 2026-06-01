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
