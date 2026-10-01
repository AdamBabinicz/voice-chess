// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

// Title: dokładnie 50 znaków
const siteTitle = "Trener szachowy audio. Poznaj taktykę i każdy ruch";

// Description: dokładnie 150 znaków
const siteDescription =
  "Trener szachowy audio. Poznaj taktykę i zaplanuj ruch głosem. Trening gry w ciemno, analiza pozycji i interaktywne łamigłówki szachowe w przeglądarce.";

const siteUrl = "https://chesstactics-audio.netlify.app";
const GTM_ID = "GTM-MXTPDXLW";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  generator: "ChessTactics Audio Coach",
  applicationName: "ChessTactics Audio Coach",
  manifest: "/site.webmanifest",
  icons: {
    // /favicon.ico ZAWSZE na pierwszym miejscu dla botów SEO (np. SEO Site Checkup)
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
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
      "x-default": siteUrl,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${siteUrl}/#app`,
        name: "ChessTactics Audio Coach",
        alternateName: "Głosowy Trener Szachowy",
        url: siteUrl,
        description: siteDescription,
        image: `${siteUrl}/og-image.png`,
        applicationCategory:
          "GameApplication, SportsApplication, EducationalApplication",
        operatingSystem: "All modern browsers with Web Speech API support",
        inLanguage: ["pl", "en"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "PLN",
        },
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
      <head>
        {/* Bezpośrednie linki do favikony dla botów SEO (SEO Site Checkup) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preconnect i dns-prefetch do serwerów analityki Google */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-background text-foreground"
      >
        {/* Google Tag Manager (noscript fallback) bez inline-styles, z tytułem dla WCAG */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            title="Google Tag Manager"
            className="hidden"
          />
        </noscript>

        {/* 1. Google Consent Mode v2 – inicjalizacja dataLayer i domyślna ochrona prywatności */}
        <Script
          id="gtm-consent-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
              gtag('js', new Date());
              window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            `,
          }}
        />

        {/* 2. Bezpośredni skrypt GTM – widoczny dla robotów SEO w kodzie HTML */}
        <Script
          id="gtm-script-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {children}
      </body>
    </html>
  );
}
