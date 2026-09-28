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
        applicationCategory:
          "GameApplication, SportsApplication, EducationalApplication",
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
      <head>
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen bg-background text-foreground"
      >
        {/* Google Tag Manager (noscript fallback) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* 1. Domyślny stan zgód Google Consent Mode v2 */}
        <Script
          id="gtm-consent-default"
          strategy="beforeInteractive"
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
            `,
          }}
        />

        {/* 2. Inteligentny loader GTM (odpala przy pierwszej interakcji lub po 3.5s) */}
        <Script
          id="gtm-smart-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var loaded = false;
                function loadGTM() {
                  if (loaded) return;
                  loaded = true;
                  ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function(e) {
                    window.removeEventListener(e, loadGTM, { passive: true });
                  });
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                  var f = document.getElementsByTagName('script')[0],
                      j = document.createElement('script');
                  j.async = true;
                  j.src = 'https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
                  f.parentNode.insertBefore(j, f);
                }
                ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function(e) {
                  window.addEventListener(e, loadGTM, { passive: true, once: true });
                });
                setTimeout(loadGTM, 3500);
              })();
            `,
          }}
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
