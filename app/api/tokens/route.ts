import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const tokens = await prisma.token.findMany({
    orderBy: { rank: 'asc' },
    include: {
      _count: { select: { tokenImpacts: true } },
    },
  })
  return NextResponse.json(tokens)
}
