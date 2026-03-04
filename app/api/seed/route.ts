import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TOP_TOKENS } from '@/lib/tokens-list'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let seeded = 0
    for (const token of TOP_TOKENS) {
      await prisma.token.upsert({
        where:  { symbol: token.symbol },
        update: { keywords: token.keywords as string[], name: token.name },
        create: { symbol: token.symbol, name: token.name, keywords: token.keywords as string[] },
      })
      seeded++
    }
    return NextResponse.json({ message: `Seeded ${seeded} tokens` })
  } catch (err) {
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
