import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'PromptShip - AI Video Director & Storyboard Generator',
  description: 'Create Hollywood-level shot lists and prompts for Sora, Kling, Runway, and Veo. The ultimate AI video director tool.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
