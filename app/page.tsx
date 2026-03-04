"use client"

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/Header'
import { NewsCard } from '@/components/NewsCard'
import { VolatilityBadge } from '@/components/VolatilityBadge'
import { motion, AnimatePresence } from 'framer-motion'

type Volatility = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface StatsData {
  total: number
  high: number
  medium: number
  low: number
  avgImpact: number
}

export default function DashboardPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Volatility>('ALL')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState<StatsData>({ total: 0, high: 0, medium: 0, low: 0, avgImpact: 0 })
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchNews = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page
    if (reset) { setLoading(true); setNews([]) }

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '30',
        ...(filter !== 'ALL' ? { volatility: filter } : {}),
      })
      const res = await fetch(`/api/news?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      setNews(prev => reset ? data.news : [...prev, ...data.news])
      setHasMore(currentPage < data.pagination.totalPages)
      setLastUpdate(new Date())

      // Compute stats from first load
      if (currentPage === 1 && filter === 'ALL') {
        const h = data.news.filter((n: any) => n.volatility === 'HIGH').length
        const m = data.news.filter((n: any) => n.volatility === 'MEDIUM').length
        const l = data.news.filter((n: any) => n.volatility === 'LOW').length
        const avg = data.news.reduce((s: number, n: any) => s + n.impactScore, 0) / (data.news.length || 1)
        setStats({ total: data.pagination.total, high: h, medium: m, low: l, avgImpact: Math.round(avg) })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    fetchNews(true)
    setPage(1)
  }, [filter])

  useEffect(() => {
    if (page > 1) fetchNews(false)
  }, [page])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews])

  const FILTERS: { label: string; value: Volatility }[] = [
    { label: 'ALL', value: 'ALL' },
    { label: 'HIGH', value: 'HIGH' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'LOW', value: 'LOW' },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff6a] pulse" />
            <span className="font-mono text-[10px] text-[#444] tracking-widest uppercase">
              Live Intelligence Feed
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-white">Crypto </span>
            <span className="text-gradient-cyan">Market Intel</span>
          </h1>
          <p className="text-[#555] text-sm max-w-xl">
            Real-time news aggregation with automated token impact scoring and volatility prediction.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Articles" value={stats.total} mono />
          <StatCard label="HIGH Volatility" value={stats.high} color="#ff3b3b" />
          <StatCard label="MED Volatility" value={stats.medium} color="#ff8c00" />
          <StatCard label="Avg Impact" value={`${stats.avgImpact}/100`} mono />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-[#444] tracking-widest mr-2">FILTER:</span>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded border tracking-widest transition-all
                ${filter === f.value
                  ? f.value === 'HIGH' ? 'bg-[#ff3b3b]/10 border-[#ff3b3b]/40 text-[#ff3b3b]'
                    : f.value === 'MEDIUM' ? 'bg-[#ff8c00]/10 border-[#ff8c00]/40 text-[#ff8c00]'
                    : f.value === 'LOW' ? 'bg-[#00ff6a]/10 border-[#00ff6a]/40 text-[#00ff6a]'
                    : 'bg-[#00fff0]/10 border-[#00fff0]/40 text-[#00fff0]'
                  : 'bg-transparent border-[#222] text-[#555] hover:border-[#333] hover:text-[#888]'
                }`}
            >
              {f.label}
            </button>
          ))}

          {lastUpdate && (
            <span className="ml-auto font-mono text-[10px] text-[#333]">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* News Grid */}
        {loading && news.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item, i) => (
                <NewsCard key={item.id} news={item} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setPage(p => p + 1)}
              className="font-mono text-xs px-6 py-2.5 border border-[#222] rounded
                text-[#555] hover:text-[#00fff0] hover:border-[#00fff0]/30 transition-all"
            >
              LOAD MORE
            </button>
          </div>
        )}

        {/* Terminal footer */}
        <div className="border-t border-[#111] pt-8 pb-4">
          <div className="font-mono text-[10px] text-[#333] space-y-1">
            <p className="cursor">talons-news v1.0.0</p>
            <p>Sources: CryptoPanic · CoinDesk · CoinTelegraph · The Block · Decrypt · Blockworks</p>
            <p>Engine: Sentiment NLP · Keyword Matching · Impact Scoring · Volatility Prediction</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, color, mono }: { label: string; value: string | number; color?: string; mono?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-lg p-4 space-y-1"
    >
      <div className="font-mono text-[9px] text-[#444] tracking-widest uppercase">{label}</div>
      <div
        className={`text-2xl font-bold ${mono ? 'font-mono' : ''}`}
        style={{ color: color || '#e5e5e5' }}
      >
        {value}
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-5 w-12" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
      <div className="skeleton h-6 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-12" />
        <div className="skeleton h-5 w-12" />
        <div className="skeleton h-5 w-12" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-24 space-y-4"
    >
      <div className="font-mono text-[#333] text-5xl">[ ]</div>
      <p className="font-mono text-sm text-[#444]">No articles found</p>
      <p className="font-mono text-[10px] text-[#333]">
        Click REFRESH to fetch the latest crypto news
      </p>
    </motion.div>
  )
}
