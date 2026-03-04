"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Header() {
  const [time, setTime] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toUTCString().replace('GMT', 'UTC'))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/news/sync', { method: 'POST' })
    } finally {
      setTimeout(() => setRefreshing(false), 1500)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L4 8v8c0 7.5 5.5 14 12 16 6.5-2 12-8.5 12-16V8L16 2z" 
                  stroke="#00fff0" strokeWidth="1.5" fill="none" 
                  className="group-hover:stroke-white transition-colors" />
                <path d="M10 16l4 4 8-8" stroke="#00fff0" strokeWidth="1.5" 
                  strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:stroke-white transition-colors" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#00ff6a] rounded-full pulse" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">TALONS</span>
              <span className="text-[#00fff0] font-bold text-lg tracking-tight"> NEWS</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm text-[#888] hover:text-white transition-colors rounded">
              Dashboard
            </Link>
            <Link href="/tokens" className="px-3 py-1.5 text-sm text-[#888] hover:text-white transition-colors rounded">
              Tokens
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden lg:block font-mono text-[10px] text-[#444]">{time}</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono 
                border border-[#222] rounded text-[#888] hover:text-[#00fff0] 
                hover:border-[#00fff0]/30 transition-all disabled:opacity-40"
            >
              <svg
                className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15-6.7M20 15a9 9 0 0 1-15 6.7" />
              </svg>
              {refreshing ? 'FETCHING...' : 'REFRESH'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
