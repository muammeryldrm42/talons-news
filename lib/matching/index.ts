// ============================================================
// TALONS NEWS - Token Matching Engine
// ============================================================

import { TOP_TOKENS, TokenDefinition } from '../tokens'

export interface TokenMatch {
  token: TokenDefinition
  confidenceScore: number  // 0 to 1
  matchedTerms: string[]
}

export function matchTokensInText(title: string, content?: string): TokenMatch[] {
  const text = [title, content].filter(Boolean).join(' ').toLowerCase()
  const matches: TokenMatch[] = []

  for (const token of TOP_TOKENS) {
    const matchedTerms: string[] = []
    let score = 0

    // Symbol exact match (high confidence - word boundary check)
    const symbolRegex = new RegExp(`\\b${token.symbol.toLowerCase()}\\b`, 'i')
    if (symbolRegex.test(text)) {
      matchedTerms.push(token.symbol)
      score += 0.5
    }

    // Name match
    if (text.includes(token.name.toLowerCase())) {
      matchedTerms.push(token.name)
      score += 0.4
    }

    // Keyword matches
    let keywordHits = 0
    for (const keyword of token.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!matchedTerms.includes(keyword)) {
          matchedTerms.push(keyword)
          keywordHits++
        }
      }
    }

    if (keywordHits > 0) {
      score += Math.min(0.4, keywordHits * 0.15)
    }

    // Only include if we have a meaningful match
    if (matchedTerms.length > 0) {
      matches.push({
        token,
        confidenceScore: Math.min(1, score),
        matchedTerms,
      })
    }
  }

  // Sort by confidence descending, take top 5
  return matches
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5)
}

export function getPrimaryToken(matches: TokenMatch[]): TokenMatch | null {
  return matches.length > 0 ? matches[0] : null
}
