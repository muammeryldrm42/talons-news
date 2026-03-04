# 🦅 Talons News — Crypto Intelligence Engine

Real-time Crypto News → Token Impact → Volatility Prediction

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/talons-news)

---

## ✨ Features

- **Automatic News Aggregation** — CryptoPanic API + CoinDesk, CoinTelegraph, The Block, Decrypt, Blockworks RSS
- **Token Impact Matching** — Keyword, symbol, and narrative detection across 50+ tokens
- **Sentiment Analysis** — Local NLP scoring (−1 to +1), no paid AI APIs
- **Impact Score Engine** — Formula-based 0–100 scoring with source authority weighting
- **Volatility Prediction** — LOW / MEDIUM / HIGH badges with color coding
- **Live Dashboard** — Auto-refresh every 5 minutes, filterable by volatility
- **Token Pages** — Per-token news history and average impact
- **Manual Sync API** — Fetch on demand from dashboard, no paid schedulers

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/talons-news
cd talons-news
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your DATABASE_URL and CRYPTOPANIC_API_KEY
```

### 3. Setup Database

**Option A: Neon (recommended)**
1. Create account at https://neon.tech
2. Create a new database
3. Copy the connection string to `DATABASE_URL`

**Option B: Supabase**
1. Create account at https://supabase.com
2. Create a new project
3. Go to Settings → Database → Connection String

Then run migrations:
```bash
npx prisma generate
npx prisma db push
```

Or use the raw SQL:
```bash
psql $DATABASE_URL < schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🌐 Deploy to Vercel

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/talons-news)

### Option B: CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Environment Variables on Vercel
Go to your project → Settings → Environment Variables and add:
- `DATABASE_URL` — your Neon/Supabase connection string
- `DIRECT_URL` — same as DATABASE_URL (or direct connection URL for Supabase)
- `CRYPTOPANIC_API_KEY` — from cryptopanic.com (free tier)

---

## 📁 Project Structure

```
talons-news/
├── app/
│   ├── api/
│   │   ├── news/sync/route.ts        ← Manual news sync endpoint
│   │   ├── news/route.ts             ← News list API
│   │   ├── news/[id]/route.ts        ← News detail API
│   │   └── tokens/
│   │       ├── route.ts              ← Token list API
│   │       └── [symbol]/route.ts     ← Token detail API
│   ├── news/[id]/page.tsx            ← News detail page
│   ├── tokens/
│   │   ├── page.tsx                  ← Token registry
│   │   └── [symbol]/page.tsx         ← Token detail page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      ← Main dashboard
├── components/
│   ├── Header.tsx
│   ├── NewsCard.tsx
│   ├── VolatilityBadge.tsx
│   ├── ImpactScore.tsx
│   └── SentimentBar.tsx
├── lib/
│   ├── db.ts                         ← Prisma client
│   ├── news/fetcher.ts               ← RSS + CryptoPanic fetcher
│   ├── scoring/index.ts              ← Impact scoring engine
│   ├── matching/index.ts             ← Token matching engine
│   └── tokens/index.ts               ← Token registry + narratives
├── prisma/
│   └── schema.prisma                 ← Database schema
├── schema.sql                        ← Raw SQL schema
├── .env.example
└── README.md
```

---

## 📊 Scoring Formula

```
ImpactScore = (|sentiment| × 30)
            + (keyword_power × 30)
            + (source_authority × 20)
            + (market_cap_tier × 20)

Normalized to 0–100

Volatility:
  score > 75  → HIGH   (red)
  score 40–75 → MEDIUM (orange)
  score < 40  → LOW    (green)
```

---

## 🔑 Free APIs Used

| Service | Purpose | Limit |
|---------|---------|-------|
| [CryptoPanic](https://cryptopanic.com/developers/api/) | Crypto news | 100 req/day free |
| CoinDesk RSS | News | Unlimited |
| CoinTelegraph RSS | News | Unlimited |
| The Block RSS | News | Unlimited |
| Decrypt RSS | News | Unlimited |
| Blockworks RSS | News | Unlimited |
| [Neon](https://neon.tech) | PostgreSQL | 3GB free |
| [Vercel](https://vercel.com) | Hosting | Free tier |

---

## 📜 License

MIT — Built for the crypto community 🦅
