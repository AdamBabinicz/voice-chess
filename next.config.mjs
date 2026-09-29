// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Wyłącza podwójne renderowanie komponentów w trybie dev
  turbopack: {}, // Wycisza konflikt konfiguracji z Turbopackiem w Next.js 16
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Tylko biblioteki ikonowe – usunięto chess.js, który w devie powodował błędy rozbijania modułów
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(favicon.*|apple-touch-icon.*|site.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = ["web", "es2022"];
      config.resolve.alias = {
        ...config.resolve.alias,
        "next/dist/build/polyfills/polyfill-module": false,
        "@next/polyfill-module": false,
      };
    }
    return config;
  },
};

export default nextConfig;
