import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols') || 'bitcoin,ethereum,solana,xrp,bnb'

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }, // Cache 1 min
      }
    )
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[Market] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
