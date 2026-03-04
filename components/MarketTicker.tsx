"use client"

import { useState, useEffect } from 'react'

const COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'binancecoin', symbol: 'BNB' },
]

interface PriceData {
  usd: number
  usd_24h_change: number
}

export function MarketTicker() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = COINS.map(c => c.id).join(',')
    const fetchPrices = () => {
      fetch(`/api/market?symbols=${ids}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            setPrices(data)
            setLoading(false)
          }
        })
        .catch(() => setLoading(false))
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return null

  return (
    <div className="border-b border-[#111] bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 py-2 overflow-x-auto scrollbar-none">
          {COINS.map(coin => {
            const price = prices[coin.id]
            if (!price) return null
            const change = price.usd_24h_change || 0
            const isUp = change >= 0
            return (
              <div key={coin.id} className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-[#555]">{coin.symbol}</span>
                <span className="font-mono text-[10px] text-[#888]">
                  ${price.usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono text-[10px] ${isUp ? 'text-[#00ff6a]' : 'text-[#ff3b3b]'}`}>
                  {isUp ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
