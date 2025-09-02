import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import "./globals.css";
import ClientRootLayout from "@/components/ClientRootLayout";

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
      <body className="font-euclid-circular-a">
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}
