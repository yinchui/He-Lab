import { CATEGORIES, Category } from '@/lib/types'

interface Props {
  active: Category | null
  onChange: (cat: Category | null) => void
}

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto border-b-2 border-blue-200 bg-blue-50 px-4">
      {[null, ...CATEGORIES].map((cat) => (
        <button
          key={cat ?? 'all'}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
            active === cat
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          {cat ?? '全部'}
        </button>
      ))}
    </div>
  )
}
