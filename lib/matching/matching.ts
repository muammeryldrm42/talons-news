export interface TokenMatch {
  tokenId:         string
  symbol:          string
  name:            string
  confidenceScore: number
  marketCap?:      number | null
}

export interface TokenRecord {
  id:       string
  name:     string
  symbol:   string
  keywords: string[]
  marketCap?: number | null
}

/**
 * Matches tokens mentioned in a news article.
 * Uses symbol detection, name detection, and keyword matching.
 * Returns tokens with confidence scores (0–1).
 */
export function matchTokens(
  text: string,
  tokens: TokenRecord[]
): TokenMatch[] {
  const lower = text.toLowerCase()
  const matches: TokenMatch[] = []

  for (const token of tokens) {
    let confidence = 0
    let hits = 0

    // 1. Exact symbol match (e.g. $BTC, BTC, "BTC ")  — high confidence
    const symbolPattern = new RegExp(
      `(\\$${token.symbol}|\\b${token.symbol}\\b)`,
      'gi'
    )
    const symbolMatches = text.match(symbolPattern)
    if (symbolMatches) {
      confidence += 0.6
      hits += symbolMatches.length
    }

    // 2. Full name match (e.g. "Bitcoin") — high confidence
    if (lower.includes(token.name.toLowerCase())) {
      confidence += 0.5
      hits++
    }

    // 3. Keyword matches — medium confidence
    for (const keyword of token.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        confidence += 0.15
        hits++
      }
    }

    // Only include if some match was found
    if (confidence > 0) {
      matches.push({
        tokenId:         token.id,
        symbol:          token.symbol,
        name:            token.name,
        confidenceScore: Math.min(1, confidence),
        marketCap:       token.marketCap,
      })
    }
  }

  // Sort by confidence descending, return top 10
  return matches
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 10)
}
