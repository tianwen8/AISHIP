import type { Metadata } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import { Header } from '@/components/layout/Header'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Cineprompt - AI Video Director & Storyboard Generator',
  description: 'Create Hollywood-level shot lists and prompts for Sora, Kling, Runway, and Veo. The ultimate AI video director tool.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} font-body bg-gray-50 text-gray-900 antialiased`}
      >
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
