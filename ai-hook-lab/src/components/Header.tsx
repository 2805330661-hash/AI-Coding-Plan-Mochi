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
