const { withSentryConfig } = require('@sentry/nextjs');

// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pageExtensions = ['page.tsx', 'ts'];
if (process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true') pageExtensions.push('governance.tsx');
if (process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true') pageExtensions.push('staking.tsx');

/** @type {import('next').NextConfig} */
module.exports = withSentryConfig(
  withBundleAnalyzer({
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
      config.experiments = {
        topLevelAwait: true,
        layers: true, // added for next api routes rpc proxy
      };
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
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
  }),
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'avara-ex',
    project: 'aave-v3',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
