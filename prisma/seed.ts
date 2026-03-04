import { PrismaClient } from '@prisma/client'
import { TOP_TOKENS } from '../lib/tokens'

const prisma = new PrismaClient()

async function main() {
  console.log(`Seeding ${TOP_TOKENS.length} tokens...`)

  for (const token of TOP_TOKENS) {
    await prisma.token.upsert({
      where: { symbol: token.symbol },
      update: {
        name: token.name,
        keywords: token.keywords,
        rank: token.rank,
      },
      create: {
        name: token.name,
        symbol: token.symbol,
        keywords: token.keywords,
        rank: token.rank,
      },
    })
    process.stdout.write('.')
  }

  console.log('\n✅ Seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
