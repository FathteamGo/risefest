/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { forceSwcTransforms: true },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmsmj.fathforce.com';
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST_1 || 'cmsmj.fathforce.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST_2 || 'cms.mudajuara.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST_3 || 'localhost',
        port: process.env.NEXT_PUBLIC_IMAGE_PORT_3 || '8000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
