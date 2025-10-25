/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Turbopack for handling SVG files
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Add any other configuration options here
};

module.exports = nextConfig;