/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Turbopack root directory
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  // Add any other configuration options here
};

module.exports = nextConfig;