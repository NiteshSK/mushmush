import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import "./globals.css";
import type { Metadata } from "next";
import ClientRootLayout from "@/components/ClientRootLayout";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";

// Defaults for every page. Pages set their own title, description and canonical address.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kosvana | Himalayan pantry: dried mushrooms, spices and dry fruits",
  description: "Mushrooms grown by hand in Herbertpur, Dehradun. Dried mushrooms, spices, dry fruits and seeds delivered across India; fresh mushrooms in Dehradun.",
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", images: [BUSINESS.shareImage] },
  twitter: { card: "summary_large_image", images: [BUSINESS.shareImage] },
  formatDetection: { telephone: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN">
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