// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

// Title: dokładnie 50 znaków
const siteTitle = "Trener szachowy audio. Poznaj taktykę i każdy ruch";

// Description: dokładnie 150 znaków
const siteDescription =
  "Trener szachowy audio. Poznaj taktykę i zaplanuj ruch głosem. Trening gry w ciemno, analiza pozycji i interaktywne łamigłówki szachowe w przeglądarce.";

const siteUrl = "https://chesstactics-audio.netlify.app";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  generator: "ChessTactics Audio Coach",
  applicationName: "ChessTactics Audio Coach",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChessTactics Audio Coach",
  },
  openGraph: {
    siteName: "ChessTactics Audio Coach",
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "pl_PL",
    alternateLocale: "en_US",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "ChessTactics Audio Coach - Trener szachowy audio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
    languages: {
      pl: siteUrl,
      en: `${siteUrl}/en`,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#166534" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Kompletny graf Schema.org z WebApplication oraz Identity Schema (Person / Creator)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#author`,
        name: "Adam Gierczak",
        url: "https://github.com/AdamBabinicz",
        sameAs: [
          "https://github.com/AdamBabinicz",
          "https://devpost.com/AdamBabinicz",
        ],
        jobTitle: "Software Engineer & Creator",
      },
      {
        "@type": ["WebApplication", "SoftwareApplication", "SportsApplication"],
        "@id": `${siteUrl}/#app`,
        name: "ChessTactics Audio Coach",
        alternateName: "Głosowy Trener Szachowy",
        url: siteUrl,
        description: siteDescription,
        applicationCategory: "GameApplication, EducationalApplication",
        operatingSystem: "All modern browsers with Web Speech API support",
        inLanguage: ["pl", "en"],
        author: {
          "@id": `${siteUrl}/#author`,
        },
        creator: {
          "@id": `${siteUrl}/#author`,
        },
        accessibilityFeature: [
          "voiceInput",
          "voiceOutput",
          "highContrastDisplay",
          "screenReaderSupport",
          "keyboardNavigation",
        ],
      },
    ],
  };

  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-background text-foreground"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
