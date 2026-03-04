import Sentiment from 'sentiment'

const sentimentAnalyzer = new Sentiment()

// Source authority weights (0–1)
const SOURCE_WEIGHTS: Record<string, number> = {
  coindesk:     1.0,
  cointelegraph:0.95,
  theblock:     0.95,
  cryptopanic:  0.80,
  decrypt:      0.85,
  bitcoinmagazine: 0.85,
  reuters:      1.0,
  bloomberg:    1.0,
  default:      0.6,
}

// Narrative/keyword power multipliers
const NARRATIVE_KEYWORDS: Record<string, number> = {
  etf:          10,
  sec:          9,
  hack:         10,
  exploit:      10,
  'rug pull':   10,
  regulation:   9,
  lawsuit:      8,
  listing:      8,
  delisting:    9,
  bankruptcy:   10,
  fraud:        10,
  partnership:  7,
  acquisition:  8,
  launch:       7,
  upgrade:      6,
  fork:         7,
  halving:      9,
  airdrop:      6,
  'all-time high': 8,
  ath:          8,
  crash:        9,
  dump:         8,
  pump:         7,
  ban:          9,
  approval:     9,
  integration:  6,
  mainnet:      7,
  testnet:      4,
  vulnerability:9,
}

export interface SentimentResult {
  score: number       // normalized -1 to +1
  comparative: number
  positive: string[]
  negative: string[]
}

export interface ImpactResult {
  sentimentScore: number
  impactScore: number
  volatility: 'LOW' | 'MEDIUM' | 'HIGH'
  keywordPower: number
  sourceWeight: number
}

/**
 * Analyzes sentiment of a text string.
 * Returns normalized -1 to +1 score.
 */
export function analyzeSentiment(text: string): SentimentResult {
  const result = sentimentAnalyzer.analyze(text)
  // Normalize comparative score from approx -5..+5 to -1..+1
  const normalized = Math.max(-1, Math.min(1, result.comparative / 3))
  return {
    score: normalized,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative,
  }
}

/**
 * Calculates keyword power score based on narrative keywords in text.
 * Returns 0–100.
 */
export function calculateKeywordPower(text: string): number {
  const lower = text.toLowerCase()
  let power = 0
  let matches = 0

  for (const [keyword, weight] of Object.entries(NARRATIVE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      power += weight
      matches++
    }
  }

  // Normalize: max possible raw power ~100 → cap at 100
  return Math.min(100, power)
}

/**
 * Returns source authority weight (0–1) for a given source name.
 */
export function getSourceWeight(source: string): number {
  const lower = source.toLowerCase()
  for (const [key, weight] of Object.entries(SOURCE_WEIGHTS)) {
    if (lower.includes(key)) return weight
  }
  return SOURCE_WEIGHTS.default
}

/**
 * Returns a market cap factor (0–1) based on market cap value.
 * Tokens with larger market cap create more market-wide impact.
 */
export function getMarketCapFactor(marketCap?: number | null): number {
  if (!marketCap) return 0.3
  if (marketCap >= 100_000_000_000) return 1.0   // >100B
  if (marketCap >= 10_000_000_000)  return 0.8   // >10B
  if (marketCap >= 1_000_000_000)   return 0.6   // >1B
  if (marketCap >= 100_000_000)     return 0.4   // >100M
  return 0.2
}

/**
 * Master Impact Score formula:
 * (abs(sentiment) * 30) + (keyword_power * 30) + (source_weight * 20) + (market_cap_factor * 20)
 * Normalized to 0–100.
 */
export function calculateImpactScore(params: {
  sentimentScore: number
  keywordPower: number
  sourceWeight: number
  marketCapFactor: number
}): number {
  const { sentimentScore, keywordPower, sourceWeight, marketCapFactor } = params

  const sentimentComponent  = Math.abs(sentimentScore) * 30
  const keywordComponent    = (keywordPower / 100) * 30
  const sourceComponent     = sourceWeight * 20
  const marketCapComponent  = marketCapFactor * 20

  const raw = sentimentComponent + keywordComponent + sourceComponent + marketCapComponent
  return Math.min(100, Math.max(0, raw))
}

/**
 * Predicts volatility level from sentiment and impact score.
 */
export function predictVolatility(
  sentimentScore: number,
  impactScore: number
): 'LOW' | 'MEDIUM' | 'HIGH' {
  const absSentiment = Math.abs(sentimentScore)

  if (absSentiment > 0.6 && impactScore > 75) return 'HIGH'
  if (impactScore > 75) return 'HIGH'
  if (absSentiment > 0.3 || impactScore >= 40) return 'MEDIUM'
  return 'LOW'
}

/**
 * Full scoring pipeline for a single news article.
 */
export function scoreArticle(params: {
  title: string
  content?: string
  source: string
  marketCap?: number | null
}): ImpactResult {
  const { title, content, source, marketCap } = params
  const fullText = `${title} ${content ?? ''}`

  const sentiment     = analyzeSentiment(fullText)
  const keywordPower  = calculateKeywordPower(fullText)
  const sourceWeight  = getSourceWeight(source)
  const marketCapFactor = getMarketCapFactor(marketCap)

  const impactScore = calculateImpactScore({
    sentimentScore: sentiment.score,
    keywordPower,
    sourceWeight,
    marketCapFactor,
  })

  const volatility = predictVolatility(sentiment.score, impactScore)

  return {
    sentimentScore: sentiment.score,
    impactScore,
    volatility,
    keywordPower,
    sourceWeight,
  }
}
