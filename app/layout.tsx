"use server"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Talons News — Crypto Intelligence',
  description: 'Real-time crypto news impact & volatility prediction engine',
  keywords: ['crypto', 'bitcoin', 'ethereum', 'news', 'intelligence', 'volatility'],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Talons News',
    description: 'Real-time Crypto News → Token Impact → Volatility Prediction',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
