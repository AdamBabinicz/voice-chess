// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Chess Coach: Blindfold AI Game & Tactics APP",
  description:
    "Play full chess games and train tactics using only your voice. Interactive AI audio coach for blindfold players, visually impaired, and masters alike.",
  generator: "ChessTactics Audio Coach",
  applicationName: "ChessTactics Audio Coach",
  keywords: [
    "Voice Chess",
    "Blindfold Chess",
    "AI Chess Coach",
    "Szachy w ciemno",
    "Trener szachowy audio",
    "Accessibility chess",
    "WCAG chess",
  ],
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
    title: "Voice Chess Coach: Blindfold AI Game & Tactics APP",
    description:
      "Play full chess games and train tactics using only your voice. Interactive AI audio coach for blindfold players, visually impaired, and masters alike.",
    type: "website",
    locale: "pl_PL",
    alternateLocale: "en_US",
    url: "https://chesstactics-audio.netlify.app",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "ChessTactics Audio Coach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice Chess Coach: Blindfold AI Game & Tactics APP",
    description:
      "Voice-first chess training with an interactive AI audio coach.",
  },
  metadataBase: new URL("https://chesstactics-audio.netlify.app"),
  alternates: {
    languages: {
      pl: "/pl",
      en: "/",
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
    "@type": ["WebApplication", "SoftwareApplication", "SportsApplication"],
    name: "ChessTactics Audio Coach",
    alternateName: "Głosowy Trener Szachowy",
    url: "https://chesstactics-audio.netlify.app",
    description:
      "Play full chess games and train tactics using only your voice. Interactive AI audio coach for blindfold players, visually impaired, and masters alike.",
    applicationCategory: "GameApplication, EducationalApplication",
    operatingSystem: "All modern browsers with Web Speech API support",
    inLanguage: ["pl", "en"],
    accessibilityFeature: [
      "voiceInput",
      "voiceOutput",
      "highContrastDisplay",
      "screenReaderSupport",
      "keyboardNavigation",
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
