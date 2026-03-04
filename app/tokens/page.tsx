"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { motion } from 'framer-motion'

export default function TokensPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.json())
      .then(data => { setTokens(data); setLoading(false) })
  }, [])

  const filtered = tokens.filter(t =>
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Token <span className="text-gradient-cyan">Registry</span></h1>
          <p className="text-[#555] text-sm">Tracked tokens with news impact history</p>
        </div>

        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 
            font-mono text-sm text-[#ccc] placeholder-[#333] 
            focus:outline-none focus:border-[#00fff0]/30 focus:text-white transition-all"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((token, i) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Link
                  href={`/tokens/${token.symbol}`}
                  className="news-card glass rounded-lg p-3 flex flex-col gap-1.5 block"
                >
                  <div className="font-mono text-sm font-bold text-[#00fff0]">${token.symbol}</div>
                  <div className="text-xs text-[#666] truncate">{token.name}</div>
                  <div className="font-mono text-[9px] text-[#444]">
                    #{token.rank} · {token._count?.tokenImpacts || 0} news
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
