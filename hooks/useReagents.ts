import { useState, useEffect, useCallback } from 'react'
import { Reagent, Category } from '@/lib/types'

export function useReagents(category: Category | null, search: string) {
  const [reagents, setReagents] = useState<Reagent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReagents = useCallback(async (cat: Category | null, q: string, signal: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (cat) params.set('category', cat)
      if (q) params.set('search', q)
      const res = await fetch(`/api/reagents?${params}`, { signal })
      if (!res.ok) throw new Error('获取数据失败')
      setReagents(await res.json())
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    fetchReagents(category, search, controller.signal)
    return () => controller.abort()
  }, [fetchReagents, category, search])

  useEffect(() => {
    const controller = new AbortController()
    fetchReagents(category, search, controller.signal)
    return () => controller.abort()
  }, [category, search, fetchReagents])

  return { reagents, loading, error, refetch }
}
