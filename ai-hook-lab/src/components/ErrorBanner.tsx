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
