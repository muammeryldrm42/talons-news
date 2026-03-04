export type VolatilityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface VolatilityConfig {
  highImpactThreshold:   number
  highSentimentThreshold:number
  mediumImpactThreshold: number
}

const DEFAULT_CONFIG: VolatilityConfig = {
  highImpactThreshold:    75,
  highSentimentThreshold: 0.6,
  mediumImpactThreshold:  40,
}

export function predictVolatility(
  sentimentScore: number,
  impactScore:    number,
  config:         VolatilityConfig = DEFAULT_CONFIG
): VolatilityLevel {
  const absSentiment = Math.abs(sentimentScore)

  if (absSentiment >= config.highSentimentThreshold && impactScore >= config.highImpactThreshold) return 'HIGH'
  if (impactScore >= config.highImpactThreshold) return 'HIGH'
  if (absSentiment >= 0.3 || impactScore >= config.mediumImpactThreshold) return 'MEDIUM'
  return 'LOW'
}

export function getVolatilityColor(level: VolatilityLevel): string {
  switch (level) {
    case 'HIGH':   return 'text-red-400 bg-red-400/10 border-red-400/30'
    case 'MEDIUM': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
    case 'LOW':    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
  }
}

export function getVolatilityDescription(level: VolatilityLevel): string {
  switch (level) {
    case 'HIGH':   return 'Significant price movement expected within 24h'
    case 'MEDIUM': return 'Moderate price movement possible'
    case 'LOW':    return 'Minimal price impact expected'
  }
}
