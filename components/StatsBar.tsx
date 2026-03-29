import { Reagent } from '@/lib/types'

export function StatsBar({ reagents }: { reagents: Reagent[] }) {
  const total = reagents.length
  const depleted = reagents.filter((r) => r.is_depleted).length
  const available = total - depleted
  return (
    <div className="flex gap-6 px-4 py-3 bg-blue-50 border-t border-blue-200 text-center">
      {([['总计', total], ['在库', available], ['已用完', depleted]] as const).map(([label, num]) => (
        <div key={label} className="flex-1">
          <div className="text-xl font-bold text-blue-700">{num}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      ))}
    </div>
  )
}
