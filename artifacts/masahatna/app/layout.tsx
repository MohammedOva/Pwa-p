import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic, Reem_Kufi } from 'next/font/google'
import { PwaInstall } from '@/components/pwa-install'
import './globals.css'

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
})

const kufi = Reem_Kufi({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kufi',
})

export const metadata: Metadata = {
  title: 'مساحتنا — يوميات مشتركة',
  description:
    'دفتر يوميات مشترك للثنائي: المزاج والطاقة، المهام المشتركة، الرسائل، ومعرض الذكريات.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'مساحتنا',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#f3ece1',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="paper"
      className={`${plex.variable} ${kufi.variable} scroll-smooth scroll-pt-20`}
    >
      <body className="antialiased">
        {children}
        <PwaInstall />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
