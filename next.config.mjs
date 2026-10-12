// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {},
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
      {
        // Roczny, niezmienny cache dla plików audio i statycznych assetów
        source: "/(sounds|audio|pliki)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
