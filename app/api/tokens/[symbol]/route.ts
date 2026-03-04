import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.toUpperCase()

  const token = await prisma.token.findUnique({
    where: { symbol },
    include: {
      tokenImpacts: {
        include: { news: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  // Calculate avg impact
  const impacts = token.tokenImpacts
  const avgImpact = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + i.news.impactScore, 0) / impacts.length
    : 0

  return NextResponse.json({ ...token, avgImpact })
}
