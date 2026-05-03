import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'UDAAN – For Every Child | Better Health, Better Life',
  description: 'A unified digital platform to ensure every child has access to quality health, education and nutrition services.',
  keywords: 'UDAAN, HPV vaccination, child health, school tracking, government dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
