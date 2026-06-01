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
