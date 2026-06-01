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
