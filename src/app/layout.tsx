import { Inter } from 'next/font/google'
import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import "./globals.css";
import ClientRootLayout from "@/components/ClientRootLayout";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MushMush - E-commerce Platform',
  description: 'Modern e-commerce platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}
