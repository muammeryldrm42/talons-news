'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  activeFilter?: string
}

const FILTERS = [
  { label: 'ALL', value: '', color: '#00f5ff' },
  { label: '▲ HIGH', value: 'HIGH', color: '#ff3366' },
  { label: '◆ MEDIUM', value: 'MEDIUM', color: '#ff8c00' },
  { label: '▼ LOW', value: 'LOW', color: '#00ff88' },
]

export default function DashboardClient({ activeFilter }: Props) {
  const router = useRouter()

  const handleFilter = useCallback((value: string) => {
    const url = value ? `/?filter=${value}` : '/'
    router.push(url)
  }, [router])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-['JetBrains_Mono'] text-[10px] text-[#333] tracking-wider mr-1">
        FILTER:
      </span>
      {FILTERS.map((f) => {
        const isActive = (activeFilter || '') === f.value
        return (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className="font-['JetBrains_Mono'] text-[10px] tracking-wider px-3 py-1.5 rounded border transition-all duration-200"
            style={{
              color: isActive ? f.color : '#444',
              borderColor: isActive ? `${f.color}44` : '#1a1a1a',
              background: isActive ? `${f.color}0d` : 'transparent',
              textShadow: isActive ? `0 0 8px ${f.color}88` : 'none',
            }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
