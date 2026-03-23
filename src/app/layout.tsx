import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import "./globals.css";
import ClientRootLayout from "@/components/ClientRootLayout";

export const metadata = {
  title: 'Kosvana - Premium Natural Products & Superfoods',
  description: 'Naturally grown mushrooms, dry fruits, seeds & spices from Dehradun, India. Farm fresh, 100% organic, zero chemicals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}