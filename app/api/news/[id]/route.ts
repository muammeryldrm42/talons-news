import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    include: {
      tokenImpacts: {
        include: { token: true },
        orderBy: { confidenceScore: 'desc' },
      },
    },
  })

  if (!news) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(news)
}
