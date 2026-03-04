'use client'

import Link from 'next/link'

interface TokenChipProps {
  symbol:     string
  confidence: number
  volatility: string
}

const volColor: Record<string, string> = {
  HIGH:   'border-red-400/50 text-red-300',
  MEDIUM: 'border-orange-400/50 text-orange-300',
  LOW:    'border-emerald-400/50 text-emerald-300',
}

export function TokenChip({ symbol, confidence, volatility }: TokenChipProps) {
  const color = volColor[volatility] ?? volColor.LOW
  return (
    <Link
      href={`/tokens/${symbol}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-black/30 text-[10px] font-mono hover:bg-white/5 transition-colors ${color}`}
    >
      <span className="font-bold">${symbol}</span>
      <span className="text-zinc-500">{Math.round(confidence * 100)}%</span>
    </Link>
  )
}
