import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FrostWMS — Sistema de Gestão de Armazém',
    template: '%s | FrostWMS',
  },
  description:
    'Sistema de Gestão de Armazém para distribuição de alimentos congelados em Portugal.',
  keywords: ['WMS', 'armazém', 'congelados', 'gestão', 'logística', 'Portugal'],
  authors: [{ name: 'FrostWMS' }],
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
