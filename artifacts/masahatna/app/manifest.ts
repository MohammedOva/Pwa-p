import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'مساحتنا — يوميات مشتركة',
    short_name: 'مساحتنا',
    description:
      'دفتر يوميات مشترك للثنائي: المزاج والطاقة، المهام المشتركة، الرسائل، ومعرض الذكريات.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#f3ece1',
    theme_color: '#f3ece1',
    categories: ['lifestyle', 'social', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
