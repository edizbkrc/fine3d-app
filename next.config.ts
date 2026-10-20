import { NextConfig } from "next";
import fs from "fs";
import dotenv from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const envFile = `.env.${process.env.NEXT_PUBLIC_APP_ENV || "local"}`;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

console.log(
  process.env.NEXT_PUBLIC_APP_NAME +
    " is running in " +
    process.env.NEXT_PUBLIC_APP_ENV +
    " mode",
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_IMAGE_BASE_URL: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
    NEXT_PUBLIC_LOG_API_SECRET: process.env.NEXT_PUBLIC_LOG_API_SECRET,
    LOG_API_SECRET: process.env.LOG_API_SECRET,
    FINEPORTAL_URL: process.env.FINEPORTAL_URL,
    FINE3D_JWT_SECRET: process.env.FINE3D_JWT_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  output: "standalone",
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      if (config.optimization?.minimizer?.[0]?.options?.terserOptions) {
        config.optimization.minimizer[0].options.terserOptions.compress = {
          ...config.optimization.minimizer[0].options.terserOptions.compress,
          drop_console: true,
          drop_debugger: true,
        };
      }
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://dacr5dzw4p130.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dpjvxmlb5zg94.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.finegroup.com.tr",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Localde CDN CORS yok → same-origin proxy (Three.js texture + next/image + sanal tur)
  async rewrites() {
    return [
      {
        source: "/cdn-proxy/:path*",
        destination: "https://cdn.finegroup.com.tr/:path*",
      },
      {
        source: "/vt-proxy/:path*",
        destination: "https://dpjvxmlb5zg94.cloudfront.net/:path*",
      },
      {
        // Workspace kareleri (gündüz + nightImage) bu dağıtımda; CORS yalnızca
        // app.fine3d.com.tr'ye açık, localde WebGL texture'ı siyah kalıyordu.
        source: "/ws-proxy/:path*",
        destination: "https://dacr5dzw4p130.cloudfront.net/:path*",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(withPWA(nextConfig));
