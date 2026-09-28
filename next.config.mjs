/** @type {import('next').NextConfig} */
const nextConfig = {
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
    optimizePackageImports: ["lucide-react", "@base-ui/react", "chess.js"],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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
        // Zastąpienie wewnętrznego polyfillera Next.js pustym modułem (likwiduje 13 KB Legacy JS w PageSpeed)
        "next/dist/build/polyfills/polyfill-module": false,
        "@next/polyfill-module": false,
      };
    }
    return config;
  },
};

export default nextConfig;
