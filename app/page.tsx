'use client'
import { useState, useCallback } from 'react'
import { Category, Reagent } from '@/lib/types'
import { useReagents } from '@/hooks/useReagents'
import { CategoryTabs } from '@/components/CategoryTabs'
import { SearchBar } from '@/components/SearchBar'
import { StatsBar } from '@/components/StatsBar'
import { ReagentTable } from '@/components/ReagentTable'
import { ReagentCard } from '@/components/ReagentCard'
import { AddReagentModal } from '@/components/AddReagentModal'

export default function Home() {
  const [category, setCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null)
  const { reagents, loading, error, refetch } = useReagents(category, search)
  const handleSearch = useCallback((v: string) => setSearch(v), [])

  return (
    <div className="bg-white shadow-sm">
      {/* Category Tabs */}
      <CategoryTabs active={category} onChange={setCategory} />

      {/* Search + Add */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-100">
        <SearchBar onSearch={handleSearch} />
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap"
        >
          + 添加试剂
        </button>
      </div>

      {/* Stats */}
      <StatsBar reagents={reagents} />

      {/* Content */}
      <div className="px-4 py-4">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={refetch} className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm">重试</button>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <ReagentTable reagents={reagents} onRefetch={refetch} category={category} onEdit={setEditingReagent} />
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {reagents.length === 0
                ? <p className="text-center text-slate-400 py-12">暂无试剂记录</p>
                : reagents.map((r) => <ReagentCard key={r.id} reagent={r} onRefetch={refetch} onEdit={setEditingReagent} />)
              }
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddReagentModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSuccess={refetch}
        />
      )}

      {/* Edit Modal */}
      {editingReagent && (
        <AddReagentModal
          mode="edit"
          reagent={editingReagent}
          onClose={() => setEditingReagent(null)}
          onSuccess={() => {
            setEditingReagent(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
