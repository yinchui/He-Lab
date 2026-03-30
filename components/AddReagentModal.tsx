'use client'
import { useState, useRef } from 'react'
import { CATEGORIES, Category, ReagentInsert } from '@/lib/types'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_FORM = {
  category: '抑制剂' as Category,
  name: '',
  catalog_number: '',
  brand: '',
  concentration_volume: '',
  storage_location: '',
  added_by: '',
  added_date: new Date().toISOString().split('T')[0],
  image_url: null as string | null,
  cloudinary_public_id: null as string | null,
  is_depleted: false,
  // siRNA 专属
  sirna_sense_seq: '',
  sirna_antisense_seq: '',
  sirna_tube_count: '',
  // 质粒专属
  plasmid_vector_info: '',
  plasmid_resistance: '',
  plasmid_is_mutant: '',
  plasmid_mutation_info: '',
}

export function AddReagentModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const { secure_url, public_id } = await res.json()
      setForm((f) => ({ ...f, image_url: secure_url, cloudinary_public_id: public_id }))
    } catch (e) {
      setError(e instanceof Error ? e.message : '图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('试剂名称为必填项'); return }
    setSubmitting(true)
    setError(null)
    try {
      const payload: ReagentInsert = {
        ...form,
        name: form.name.trim(),
        catalog_number: form.catalog_number || null,
        brand: form.brand || null,
        concentration_volume: form.concentration_volume || null,
        storage_location: form.storage_location || null,
        added_by: form.added_by || null,
        sirna_sense_seq: form.sirna_sense_seq || null,
        sirna_antisense_seq: form.sirna_antisense_seq || null,
        sirna_tube_count: form.sirna_tube_count || null,
        plasmid_vector_info: form.plasmid_vector_info || null,
        plasmid_resistance: form.plasmid_resistance || null,
        plasmid_is_mutant: form.plasmid_is_mutant || null,
        plasmid_mutation_info: form.plasmid_mutation_info || null,
      }
      const res = await fetch('/api/reagents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100">
          <h2 className="text-base font-bold text-blue-800">添加试剂</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">分类 *</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button type="button" key={cat}
                  onClick={() => setForm((f) => ({
                    ...EMPTY_FORM,
                    name: f.name,
                    storage_location: f.storage_location,
                    added_by: f.added_by,
                    added_date: f.added_date,
                    image_url: f.image_url,
                    cloudinary_public_id: f.cloudinary_public_id,
                    category: cat,
                  }))}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                    form.category === cat
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* 名称字段 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {form.category === 'siRNA' ? 'siRNA 名称' : form.category === '质粒' ? '质粒名称' : '试剂名称'} *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="必填"
            />
          </div>

          {/* siRNA 专属 */}
          {form.category === 'siRNA' && (
            <>
              {field('正向序列', 'sirna_sense_seq')}
              {field('互补序列', 'sirna_antisense_seq')}
              {field('管数', 'sirna_tube_count')}
              {field('浓度或OD值', 'concentration_volume')}
            </>
          )}

          {/* 质粒专属 */}
          {form.category === '质粒' && (
            <>
              {field('载体信息', 'plasmid_vector_info')}
              {field('抗性', 'plasmid_resistance')}
              {field('浓度', 'concentration_volume')}
              {field('是否突变', 'plasmid_is_mutant')}
              {field('突变序列信息', 'plasmid_mutation_info')}
            </>
          )}

          {/* 通用字段（抑制剂/抗体/试剂盒/探针）*/}
          {!['siRNA', '质粒'].includes(form.category) && (
            <>
              {field('货号', 'catalog_number')}
              {field('品牌', 'brand')}
              {field('浓度/体积', 'concentration_volume')}
            </>
          )}

          {/* 所有分类共用 */}
          {field('存储位置', 'storage_location')}
          {field('入库人', 'added_by')}
          {field('入库日期', 'added_date', 'date')}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">实物照片（可选）</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              capture="environment" onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-blue-200 rounded-lg py-3 text-sm text-blue-500 hover:bg-blue-50">
              {uploading ? '上传中...' : form.image_url ? '✓ 图片已上传（点击更换）' : '点击上传或拍照'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting || uploading}
            className="w-full py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 mt-2">
            {submitting ? '提交中...' : '确认添加'}
          </button>
        </form>
      </div>
    </div>
  )
}




