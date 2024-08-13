
const cspHeader = `
    // default-src 'self';
    // script-src 'self' 'unsafe-eval' 'unsafe-inline';
    // style-src 'self' 'unsafe-inline';
    // img-src 'self' blob: data:;
    // font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // experimental: {
  //   externalDir: true,
  //   appDir: false,
  //   instrumentationHook: true,
  // },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(ts)x?$/,
      use: [
        {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
            onlyCompileBundledFiles: true,
          },
        },
      ],
    })

    return config
  },
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.NEXT_PUBLIC_ANALYZE === 'true',
  openAnalyzer: true,
});

module.exports = withBundleAnalyzer(nextConfig)

