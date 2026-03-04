import { clsx } from 'clsx'

type Volatility = 'LOW' | 'MEDIUM' | 'HIGH'

interface VolatilityBadgeProps {
  volatility: Volatility
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG = {
  HIGH:   { label: 'HIGH',   bg: 'bg-[#ff3b3b]/10', text: 'text-[#ff3b3b]', border: 'border-[#ff3b3b]/30', dot: 'bg-[#ff3b3b]' },
  MEDIUM: { label: 'MED',    bg: 'bg-[#ff8c00]/10', text: 'text-[#ff8c00]', border: 'border-[#ff8c00]/30', dot: 'bg-[#ff8c00]' },
  LOW:    { label: 'LOW',    bg: 'bg-[#00ff6a]/10', text: 'text-[#00ff6a]', border: 'border-[#00ff6a]/30', dot: 'bg-[#00ff6a]' },
}

const SIZES = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-1',
  lg: 'text-xs px-3 py-1.5',
}

export function VolatilityBadge({ volatility, size = 'md' }: VolatilityBadgeProps) {
  const c = CONFIG[volatility]
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-mono font-bold rounded border tracking-widest',
      c.bg, c.text, c.border, SIZES[size]
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot, volatility === 'HIGH' && 'pulse')} />
      {c.label}
    </span>
  )
}
