"use client"

import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface ImpactScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

function getColor(score: number) {
  if (score >= 75) return { ring: 'stroke-[#ff3b3b]', text: 'text-[#ff3b3b]', glow: '#ff3b3b' }
  if (score >= 40) return { ring: 'stroke-[#ff8c00]', text: 'text-[#ff8c00]', glow: '#ff8c00' }
  return { ring: 'stroke-[#00ff6a]', text: 'text-[#00ff6a]', glow: '#00ff6a' }
}

const SIZES = {
  sm: { dim: 36, stroke: 3, r: 14, textClass: 'text-[9px]' },
  md: { dim: 52, stroke: 3.5, r: 21, textClass: 'text-[11px]' },
  lg: { dim: 72, stroke: 4, r: 29, textClass: 'text-sm' },
}

export function ImpactScore({ score, size = 'md' }: ImpactScoreProps) {
  const { ring, text, glow } = getColor(score)
  const { dim, stroke, r, textClass } = SIZES[size]
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference
  const cx = dim / 2
  const cy = dim / 2

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke} />
        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          className={ring}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${glow}80)` }}
        />
      </svg>
      <span className={clsx('absolute font-mono font-bold tabular-nums', text, textClass)}>
        {score}
      </span>
    </div>
  )
}

// Linear bar version
export function ImpactBar({ score }: { score: number }) {
  const { glow } = getColor(score)
  const color = score >= 75 ? '#ff3b3b' : score >= 40 ? '#ff8c00' : '#00ff6a'

  return (
    <div className="w-full">
      <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background: color,
            boxShadow: `0 0 8px ${glow}60`,
          }}
        />
      </div>
    </div>
  )
}
