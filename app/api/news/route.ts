import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '30')
  const volatility = searchParams.get('volatility')
  const skip = (page - 1) * limit

  const where: any = {}
  if (volatility && ['LOW', 'MEDIUM', 'HIGH'].includes(volatility)) {
    where.volatility = volatility
  }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        tokenImpacts: {
          include: { token: true },
          orderBy: { confidenceScore: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.news.count({ where }),
  ])

  return NextResponse.json({
    news,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
