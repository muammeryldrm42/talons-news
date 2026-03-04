'use client'

interface StatsBarProps {
  total:  number
  high:   number
  medium: number
  low:    number
}

export function StatsBar({ total, high, medium, low }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: 'TOTAL NEWS',     value: total,  color: 'text-cyan-400',    border: 'border-cyan-400/20' },
        { label: 'HIGH VOLATILITY',value: high,   color: 'text-red-400',     border: 'border-red-400/20' },
        { label: 'MED VOLATILITY', value: medium, color: 'text-orange-400',  border: 'border-orange-400/20' },
        { label: 'LOW VOLATILITY', value: low,    color: 'text-emerald-400', border: 'border-emerald-400/20' },
      ].map(stat => (
        <div key={stat.label} className={`bg-[#0a0a0a] border ${stat.border} rounded-xl p-4`}>
          <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-[10px] font-mono text-zinc-600 mt-1 tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
