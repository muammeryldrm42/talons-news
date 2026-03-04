// ============================================================
// TALONS NEWS - Scoring Engine
// Formula: (abs(sentiment)*30) + (keyword_power*30) + (source_weight*20) + (market_cap_factor*20)
// ============================================================

import Sentiment from 'sentiment'
import { NARRATIVE_KEYWORDS, MARKET_CAP_WEIGHTS } from '../tokens'

const sentimentAnalyzer = new Sentiment()

export type VolatilityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ScoringInput {
  title: string
  content?: string
  source: string
  marketCapTier?: string
}

export interface ScoringResult {
  sentimentScore: number    // -1 to +1
  impactScore: number       // 0 to 100
  volatility: VolatilityLevel
  keywordPower: number      // 0 to 1
  sourceWeight: number      // 0 to 1
  marketCapFactor: number   // 0 to 1
}

// Source authority weights
const SOURCE_WEIGHTS: Record<string, number> = {
  coindesk: 0.9,
  cointelegraph: 0.85,
  theblock: 0.9,
  'the block': 0.9,
  decrypt: 0.8,
  blockworks: 0.8,
  reuters: 0.95,
  bloomberg: 0.95,
  cryptopanic: 0.7,
  bitcoinmagazine: 0.8,
  'bitcoin magazine': 0.8,
  messari: 0.85,
  defiant: 0.8,
  'the defiant': 0.8,
  dlnews: 0.75,
  'dl news': 0.75,
}

export function getSentimentScore(title: string, content?: string): number {
  const text = [title, content].filter(Boolean).join(' ')
  const result = sentimentAnalyzer.analyze(text)
  // Normalize to -1..+1
  const maxScore = Math.max(Math.abs(result.score), 1)
  return Math.max(-1, Math.min(1, result.score / (maxScore * 3)))
}

export function getKeywordPower(title: string, content?: string): number {
  const text = [title, content].filter(Boolean).join(' ').toLowerCase()
  let maxPower = 0
  let totalPower = 0
  let matchCount = 0

  for (const [keyword, power] of Object.entries(NARRATIVE_KEYWORDS)) {
    if (text.includes(keyword)) {
      maxPower = Math.max(maxPower, power)
      totalPower += power
      matchCount++
    }
  }

  if (matchCount === 0) return 0
  // Blend max + average to reward multiple matches but cap at 1
  const avg = totalPower / matchCount
  return Math.min(1, (maxPower * 0.6) + (avg * 0.4))
}

export function getSourceWeight(source: string): number {
  const sourceLower = source.toLowerCase()
  for (const [key, weight] of Object.entries(SOURCE_WEIGHTS)) {
    if (sourceLower.includes(key)) return weight
  }
  return 0.5 // default weight for unknown sources
}

export function getMarketCapFactor(marketCapTier?: string): number {
  if (!marketCapTier) return 0.5
  return MARKET_CAP_WEIGHTS[marketCapTier] ?? 0.5
}

export function calculateImpactScore(
  sentimentScore: number,
  keywordPower: number,
  sourceWeight: number,
  marketCapFactor: number
): number {
  const raw =
    Math.abs(sentimentScore) * 30 +
    keywordPower * 30 +
    sourceWeight * 20 +
    marketCapFactor * 20

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function predictVolatility(impactScore: number, sentimentScore: number): VolatilityLevel {
  if (impactScore > 75) return 'HIGH'
  if (impactScore >= 40) return 'MEDIUM'
  return 'LOW'
}

export function scoreArticle(input: ScoringInput): ScoringResult {
  const sentimentScore = getSentimentScore(input.title, input.content)
  const keywordPower = getKeywordPower(input.title, input.content)
  const sourceWeight = getSourceWeight(input.source)
  const marketCapFactor = getMarketCapFactor(input.marketCapTier)
  const impactScore = calculateImpactScore(sentimentScore, keywordPower, sourceWeight, marketCapFactor)
  const volatility = predictVolatility(impactScore, sentimentScore)

  return {
    sentimentScore,
    impactScore,
    volatility,
    keywordPower,
    sourceWeight,
    marketCapFactor,
  }
}
