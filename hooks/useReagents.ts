import { useState, useEffect, useCallback, useRef } from 'react'
import { Reagent, Category } from '@/lib/types'

export function useReagents(category: Category | null, search: string) {
  const [reagents, setReagents] = useState<Reagent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReagents = useCallback(async (cat: Category | null, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (cat) params.set('category', cat)
      if (q) params.set('search', q)
      const res = await fetch(`/api/reagents?${params}`)
      if (!res.ok) throw new Error('获取数据失败')
      setReagents(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => fetchReagents(category, search), [fetchReagents, category, search])

  useEffect(() => {
    const timer = setTimeout(() => fetchReagents(category, search), 300)
    return () => clearTimeout(timer)
  }, [category, search, fetchReagents])

  return { reagents, loading, error, refetch }
}
