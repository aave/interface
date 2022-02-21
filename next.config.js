// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    config.experiments = { topLevelAwait: true };

    return config;
  },
  reactStrictMode: true,
  // assetPrefix: "./",
  trailingSlash: true,
});
