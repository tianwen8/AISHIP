import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'AI Video Director - Create Stunning AI Videos',
  description: 'Transform your ideas into engaging videos for TikTok, YouTube Shorts, and Instagram Reels with cutting-edge AI models.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
