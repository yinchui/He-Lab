'use client'
import { useState } from 'react'
import { Reagent } from '@/lib/types'
import { ConfirmDialog } from './ConfirmDialog'

export function ReagentTable({ reagents, onRefetch }: { reagents: Reagent[]; onRefetch: () => void }) {
  const [confirm, setConfirm] = useState<{ action: 'delete' | 'deplete' | 'restore'; id: string } | null>(null)

  const handleDeplete = async (id: string, is_depleted: boolean) => {
    await fetch(`/api/reagents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_depleted }),
    })
    onRefetch()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/reagents/${id}`, { method: 'DELETE' })
    onRefetch()
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-blue-50">
            <tr>
              {['试剂名称', '货号', '品牌', '浓度/体积', '存储位置', '入库人', '日期', '图片', '状态', '操作'].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-bold text-blue-800 border-b-2 border-blue-200 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reagents.map((r) => (
              <tr key={r.id} className={r.is_depleted ? 'bg-red-50 border-b border-red-100' : 'bg-white border-b border-slate-100 hover:bg-blue-50'}>
                <td className="px-3 py-2 font-semibold">{r.name}</td>
                <td className="px-3 py-2 text-slate-500">{r.catalog_number ?? '—'}</td>
                <td className="px-3 py-2">{r.brand ?? '—'}</td>
                <td className="px-3 py-2">{r.concentration_volume ?? '—'}</td>
                <td className="px-3 py-2">{r.storage_location ?? '—'}</td>
                <td className="px-3 py-2">{r.added_by ?? '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.added_date}</td>
                <td className="px-3 py-2">
                  {r.image_url
                    ? <a href={r.image_url} target="_blank" rel="noreferrer"><img src={r.image_url} alt="" className="w-8 h-8 object-cover rounded" /></a>
                    : '—'}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.is_depleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {r.is_depleted ? '已用完' : '在库'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {r.is_depleted
                      ? <button onClick={() => setConfirm({ action: 'restore', id: r.id })} className="px-2 py-1 text-xs border border-blue-200 text-blue-700 rounded hover:bg-blue-50">恢复</button>
                      : <button onClick={() => setConfirm({ action: 'deplete', id: r.id })} className="px-2 py-1 text-xs border border-orange-200 text-orange-600 rounded hover:bg-orange-50">用完</button>}
                    <button onClick={() => setConfirm({ action: 'delete', id: r.id })} className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reagents.length === 0 && <p className="text-center text-slate-400 py-12">暂无试剂记录</p>}
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
            if (confirm.action === 'delete') handleDelete(confirm.id)
            else handleDeplete(confirm.id, confirm.action === 'deplete')
            setConfirm(null)
          }}
        />
      )}
    </>
  )
}
