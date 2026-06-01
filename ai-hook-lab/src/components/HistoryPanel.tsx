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
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-[11px] text-[#7C5CFC]">{hook.style}</span>
                                <span className="text-[11px] text-[#FBBF24]">★ {hook.clickbaitScore}</span>
                              </div>
                              <p className="text-[13px] leading-relaxed text-[#EDEDF0]">{hook.text}</p>
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
