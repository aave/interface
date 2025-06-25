// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pageExtensions = ['page.tsx'];
if (process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true') pageExtensions.push('governance.tsx');
if (process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true') pageExtensions.push('staking.tsx');

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: ['prefixIds'],
            },
          },
        },
      ],
    });
    config.experiments = { topLevelAwait: true };
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/staking',
        destination: '/',
        permanent: true,
      },
      {
        source: '/staking/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/governance',
        destination: '/',
        permanent: true,
      },
      {
        source: '/governance/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/faucet',
        destination: '/',
        permanent: true,
      },
      {
        source: '/faucet/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/v3-migration',
        destination: '/',
        permanent: true,
      },
      {
        source: '/v3-migration/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/history',
        destination: '/',
        permanent: true,
      },
      {
        source: '/history/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bridge',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bridge/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/safety-module',
        destination: '/',
        permanent: true,
      },
      {
        source: '/safety-module/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  // assetPrefix: "./",
  trailingSlash: true,
  pageExtensions,
  // NOTE: Needed for SAFE testing locally
  // async headers() {
  //   return [
  //     {
  //       source: '/manifest.json',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: '*',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'X-Requested-With, content-type, Authorization',
  //         },
  //       ],
  //     },
  //   ];
  // },
});
