import type { Metadata } from 'next'

import './globals.css'
 
export const metadata: Metadata = {
  title: 'OpenXpand',
  description: 'OpenXpand - Quick Tester',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-roboto flex flex-col min-h-screen">{children}</body>
    </html>
  )
}