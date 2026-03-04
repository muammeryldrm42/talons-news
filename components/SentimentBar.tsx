interface SentimentBarProps {
  score: number  // -1 to +1
}

export function SentimentBar({ score }: SentimentBarProps) {
  const pct = ((score + 1) / 2) * 100  // map -1..+1 to 0..100
  const isPositive = score > 0.1
  const isNegative = score < -0.1
  const label = isPositive ? 'BULLISH' : isNegative ? 'BEARISH' : 'NEUTRAL'
  const color = isPositive ? '#00ff6a' : isNegative ? '#ff3b3b' : '#888888'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-[#555] tracking-widest">SENTIMENT</span>
        <span className="font-mono text-[9px] tracking-widest" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="relative h-1 bg-[#1a1a1a] rounded-full">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 w-px h-full bg-[#333]" />
        {/* Bar */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700"
          style={{
            left: pct < 50 ? `${pct}%` : '50%',
            width: `${Math.abs(pct - 50)}%`,
            background: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-[8px] text-[#333]">−1</span>
        <span className="font-mono text-[8px] text-[#333]">0</span>
        <span className="font-mono text-[8px] text-[#333]">+1</span>
      </div>
    </div>
  )
}
