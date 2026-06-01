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

  // Track pending request to save to history after hooks arrive
  const pendingRequest = useRef<{
    topic: string
    platform: Platform
    contentType: ContentType
  } | null>(null)

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
        {error && <ErrorBanner message={error} onDismiss={reset} />}

        {/* Input Form */}
        <div className={hooks.length > 0 ? 'mb-10' : 'mt-12'}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#EDEDF0] md:text-3xl">
              爆款
              <span className="bg-gradient-to-r from-[#7C5CFC] to-[#5CE0D8] bg-clip-text text-transparent">
                Hook
              </span>{' '}
              生成器
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
