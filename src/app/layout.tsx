import type { Metadata } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Cineprompt - AI Video Director & Storyboard Generator',
  description: 'Create Hollywood-level shot lists and prompts for Sora, Kling, Runway, and Veo. The ultimate AI video director tool.',
  openGraph: {
    title: 'Cineprompt - AI Video Director & Storyboard Generator',
    description: 'Create Hollywood-level shot lists and prompts for Sora, Kling, Runway, and Veo. The ultimate AI video director tool.',
    type: 'website',
    images: ['/og-default.svg'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HX6WWC0W1Z"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HX6WWC0W1Z');
          `}
        </Script>
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "urlkjjs73f");
          `}
        </Script>
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
