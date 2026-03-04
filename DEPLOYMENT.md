# 🦅 Talons News — Vercel Deployment Guide

## Prerequisites

- [Vercel account](https://vercel.com) (free)
- [Neon PostgreSQL](https://neon.tech) free tier **or** [Supabase](https://supabase.com) free tier
- [CryptoPanic API key](https://cryptopanic.com/developers/api/) (free)
- Node.js 18+

---

## Step 1: Database Setup

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) → Create account → New project
2. Name it `talons-news`
3. Copy the **Connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb`)
4. Open the SQL editor and paste the contents of `schema.sql` → Run

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string (use "URI" format)
3. SQL Editor → Paste `schema.sql` → Run

---

## Step 2: Get API Keys

### CryptoPanic (Required)
1. Go to [cryptopanic.com/developers/api](https://cryptopanic.com/developers/api/)
2. Sign up → Copy your `auth_token`

### CoinGecko (Optional — free, no key required for basic use)
- Public endpoints work without a key
- Optional: [coingecko.com/en/api](https://www.coingecko.com/en/api) → free account for higher rate limits

---

## Step 3: Local Development

```bash
# Clone / copy project files
cd talons-news

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Edit .env.local with your values:
# DATABASE_URL=<your neon/supabase connection string>
# CRYPTOPANIC_API_KEY=<your key>
# CRON_SECRET=<generate: openssl rand -hex 32>

# Generate Prisma client
npm run db:generate

# Push schema to database (if not using schema.sql directly)
npm run db:push

# Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## Step 4: Trigger First News Fetch (Local)

```bash
curl http://localhost:3000/api/cron/fetch-news
```

Or set `CRON_SECRET` and use:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/fetch-news
```

---

## Step 5: Deploy to Vercel

### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then set env vars:
vercel env add DATABASE_URL
vercel env add CRYPTOPANIC_API_KEY
vercel env add CRON_SECRET

# Redeploy with env vars
vercel --prod
```

### Via Vercel Dashboard
1. Push code to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. **Environment Variables** section — add all three vars from `.env.example`
4. Click **Deploy**

---

## Step 6: Configure Cron Job

The `vercel.json` file already configures the cron:
```json
{
  "crons": [{
    "path": "/api/cron/fetch-news",
    "schedule": "*/5 * * * *"
  }]
}
```

**Important:** Vercel Cron sends requests with `Authorization: Bearer YOUR_CRON_SECRET`
Make sure `CRON_SECRET` is set in Vercel environment variables.

For the free Vercel plan, cron jobs run once per day minimum. Upgrade to Pro for 5-minute intervals.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `CRYPTOPANIC_API_KEY` | ✅ Yes | CryptoPanic free API token |
| `CRON_SECRET` | ✅ Yes | Random secret for cron auth |
| `COINGECKO_API_KEY` | ❌ Optional | CoinGecko demo API key |
| `NEXT_PUBLIC_APP_URL` | ❌ Optional | Your deployment URL |

---

## Architecture Overview

```
talons-news/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── DashboardClient.tsx         # Filter buttons (client)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Dark terminal styles
│   ├── news/[id]/page.tsx          # Article detail + analysis
│   ├── tokens/page.tsx             # Token directory
│   ├── tokens/[symbol]/page.tsx    # Token intelligence page
│   └── api/
│       ├── cron/fetch-news/route.ts   # Scheduled news fetcher
│       ├── news/route.ts              # News listing API
│       ├── news/[id]/route.ts         # Single news API
│       └── tokens/route.ts            # Tokens API
├── components/
│   ├── Header.tsx                  # Nav + live clock
│   ├── NewsCard.tsx                # News card with metrics
│   ├── VolatilityBadge.tsx         # HIGH/MEDIUM/LOW badge
│   ├── ImpactScore.tsx             # Score + progress bar
│   ├── SentimentBar.tsx            # Sentiment visualization
│   └── StatsBar.tsx                # Dashboard statistics
├── lib/
│   ├── db.ts                       # Prisma singleton
│   ├── tokens-list.ts              # Top 100 token definitions
│   ├── news/fetcher.ts             # CryptoPanic + RSS aggregator
│   ├── scoring/index.ts            # Sentiment + impact engine
│   └── matching/index.ts           # Token entity extractor
├── prisma/schema.prisma            # Database schema
├── schema.sql                      # Raw SQL schema
├── vercel.json                     # Cron + function config
└── .env.example                    # Env vars template
```

---

## Scoring Formula

```
Impact Score (0-100) =
  abs(sentimentScore) × 30   // How strong the sentiment is
  + keywordPower × 30        // Importance of narrative keywords  
  + sourceWeight × 20        // Authority of the news source
  + marketCapFactor × 20     // Market cap of affected tokens

Volatility:
  HIGH   → abs(sentiment) ≥ 0.6 AND impact ≥ 70, or impact ≥ 75
  MEDIUM → abs(sentiment) ≥ 0.3 AND impact ≥ 35, or impact ≥ 40
  LOW    → everything else
```

---

## Free Tier Limits

| Service | Free Limit | Talons Usage |
|---------|-----------|--------------|
| Neon PostgreSQL | 512 MB storage | ~50MB/month |
| Vercel Functions | 100GB-hours/month | Well within limits |
| Vercel Cron | 1/day (free) / unlimited (Pro) | 1-day or 5-min |
| CryptoPanic | 1000 req/day | ~288/day at 5-min |
| CoinGecko | 30 req/min | Occasional enrichment |

---

## Troubleshooting

**"PrismaClientInitializationError"**
→ Check `DATABASE_URL` is set correctly with `?sslmode=require`

**No articles appearing**  
→ Trigger cron manually: `curl /api/cron/fetch-news`  
→ Check Vercel Function logs for errors

**RSS feeds failing**
→ Some feeds may block serverless IPs; CryptoPanic API is the primary source

**Cron not running**
→ Vercel free plan: manual trigger or upgrade to Pro for scheduled runs

---

*Built with ❤️ — Talons News Crypto Intelligence Engine*
