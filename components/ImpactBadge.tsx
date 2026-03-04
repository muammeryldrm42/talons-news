'use client'

function getImpactColor(score: number): string {
  if (score >= 75) return 'text-red-400 border-red-400/40'
  if (score >= 40) return 'text-orange-400 border-orange-400/40'
  return 'text-cyan-400 border-cyan-400/40'
}

export function ImpactBadge({ score }: { score: number }) {
  const rounded = Math.round(score)
  const colorClass = getImpactColor(score)

  return (
    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${colorClass} bg-black/40 shrink-0`}>
      <span className="text-xs font-mono font-bold leading-none">{rounded}</span>
      <span className="text-[8px] font-mono text-zinc-500 mt-0.5">IMPACT</span>
    </div>
  )
}
