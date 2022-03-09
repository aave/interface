// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pageExtensions = ['page.tsx'];
if (process.env.ENABLE_GOVERNANCE === 'true') pageExtensions.push('governance.tsx');
if (process.env.ENABLE_STAKING === 'true') pageExtensions.push('staking.tsx');

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
  pageExtensions,
});
