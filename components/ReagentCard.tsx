'use client'
import { useState } from 'react'
import { Reagent } from '@/lib/types'
import { ConfirmDialog } from './ConfirmDialog'

export function ReagentCard({ reagent, onRefetch }: { reagent: Reagent; onRefetch: () => void }) {
  const [confirm, setConfirm] = useState<{ action: 'delete' | 'deplete' | 'restore' } | null>(null)

  const handleDeplete = async (is_depleted: boolean) => {
    const res = await fetch(`/api/reagents/${reagent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_depleted }),
    })
    if (res.ok) onRefetch()
  }

  const handleDelete = async () => {
    const res = await fetch(`/api/reagents/${reagent.id}`, { method: 'DELETE' })
    if (res.ok) onRefetch()
  }

  const r = reagent

  return (
    <>
      <div className={`rounded-xl border shadow-sm p-4 flex gap-3 ${
        r.is_depleted ? 'bg-red-50 border-red-100' : 'bg-white border-blue-100'
      }`}>
        {r.image_url && (
          <a href={r.image_url} target="_blank" rel="noreferrer" className="flex-shrink-0">
            <img src={r.image_url} alt="" className="w-16 h-16 object-cover rounded-lg" />
          </a>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{r.name}</h3>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
              r.is_depleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {r.is_depleted ? '已用完' : '在库'}
            </span>
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-slate-500">
            {r.catalog_number && <p>货号：{r.catalog_number}</p>}
            {r.brand && <p>品牌：{r.brand}</p>}
            {r.concentration_volume && <p>浓度/体积：{r.concentration_volume}</p>}
            {r.storage_location && <p>存储位置：{r.storage_location}</p>}
            {r.added_by && <p>入库人：{r.added_by}</p>}
            <p>入库日期：{r.added_date}</p>
          </div>
          <div className="flex gap-2 mt-3">
            {r.is_depleted
              ? <button onClick={() => setConfirm({ action: 'restore' })} className="px-3 py-1 text-xs border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50">恢复在库</button>
              : <button onClick={() => setConfirm({ action: 'deplete' })} className="px-3 py-1 text-xs border border-orange-200 text-orange-600 rounded-full hover:bg-orange-50">标记用完</button>}
            <button onClick={() => setConfirm({ action: 'delete' })} className="px-3 py-1 text-xs border border-red-200 text-red-500 rounded-full hover:bg-red-50">删除</button>
          </div>
        </div>
      </div>
      {confirm && (
        <ConfirmDialog
          message={
            confirm.action === 'delete' ? '确认删除？操作不可撤销。'
            : confirm.action === 'deplete' ? '标记为已用完？'
            : '恢复为在库？'
          }
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.action === 'delete') handleDelete()
            else handleDeplete(confirm.action === 'deplete')
            setConfirm(null)
          }}
        />
      )}
    </>
  )
}
