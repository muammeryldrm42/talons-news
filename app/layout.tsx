import type { Metadata, Viewport } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
