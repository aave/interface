// Content Security Policy, served as `Content-Security-Policy-Report-Only`.
//
// Report-only: browsers never block anything, they only report requests that fall outside this
// allowlist. The reports tell us what still needs adding and when enforcement would be safe.
// Connections are listed explicitly (rather than `https:`) so unknown origins show up in reports.
//
// Reports go to CSP_REPORT_URI (e.g. Sentry's security endpoint for the aave-v3 project). Without
// it the header is still sent, so violations show in the browser console during development.

const isDev = process.env.NODE_ENV === 'development';

const rpcs = [
  '*.publicnode.com',
  '*.drpc.org',
  '*.tenderly.co',
  '*.blockpi.network',
  '*.quiknode.pro',
  'rpc.ankr.com',
  'rpc.flashbots.net',
  'public-op-mainnet.fastnode.io',
  'arb1.arbitrum.io',
  'sepolia-rollup.arbitrum.io',
  'api.avax.network',
  'api.avax-test.network',
  'mainnet.base.org',
  'sepolia.base.org',
  'sepolia.optimism.io',
  'rpc.gnosischain.com',
  'andromeda.metis.io',
  'mainnet.era.zksync.io',
  'rpc.scroll.io',
  'sepolia-rpc.scroll.io',
  'rpc.mantle.xyz',
  'rpc.soniclabs.com',
  'rpc.soneium.org',
  'rpc.xlayer.tech',
  'rpc.plasma.to',
  'rpc.monad.xyz',
  'rpc1.monad.xyz',
  'mainnet.megaeth.com',
];

const wallets = [
  // WalletConnect / Reown relay, verify and explorer
  '*.walletconnect.com',
  'wss://*.walletconnect.com',
  '*.walletconnect.org',
  'wss://*.walletconnect.org',
  '*.reown.com',
  'wss://*.reown.com',
  // Coinbase Wallet SDK
  '*.coinbase.com',
  'wss://*.coinbase.com',
  // Family (ConnectKit) and Fun (@funkit/connect, which uses Relay and reports to Datadog)
  '*.family.co',
  '*.fun.xyz',
  '*.relay.link',
  'browser-intake-datadoghq.com',
  // Safe{Wallet} when running as a Safe App
  '*.safe.global',
];

const services = [
  '*.aave.com',
  'wss://*.aave.com',
  // Analytics and error reporting
  '*.amplitude.com',
  '*.sentry.io',
  // Market data, rewards, swaps, bridging, on-ramp, identity
  '*.coingecko.com',
  '*.merkl.xyz',
  '*.cow.fi',
  '*.paraswap.io',
  '*.velora.xyz',
  'ccip.chain.link',
  'apps.aavechan.com',
  '*.transak.com',
  'wss://*.transak.com',
  '*.self.xyz',
  '*.thegraph.com',
  'tokenlogic-data.ddn.hasura.app',
  'metisapi.0xgraph.xyz',
  'metadata.ens.domains',
  'raw.githubusercontent.com',
];

const withScheme = (source) => (source.includes('://') ? source : `https://${source}`);

const directives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'", ...(isDev ? ["'unsafe-eval'"] : [])],
  // Emotion/MUI inject styles at runtime
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  // Token, reward and wallet icons come from many hosts; tighten once reports show the set.
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'connect-src': [
    "'self'",
    ...[...rpcs, ...wallets, ...services].map(withScheme),
    ...(isDev ? ['ws://localhost:*', 'http://localhost:*', 'http://127.0.0.1:*'] : []),
  ],
  'frame-src': [
    "'self'",
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
    'https://*.transak.com',
    'https://*.family.co',
    'https://*.fun.xyz',
  ],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  // No frame-ancestors: the app is embedded by Safe{Wallet} and other wallet hosts.
};

function getCspHeaders() {
  const reportUri = process.env.CSP_REPORT_URI;
  const policy = Object.entries(directives).map(
    ([name, sources]) => `${name} ${sources.join(' ')}`
  );
  const headers = [];

  if (reportUri) {
    policy.push(`report-uri ${reportUri}`, 'report-to csp-endpoint');
    headers.push({ key: 'Reporting-Endpoints', value: `csp-endpoint="${reportUri}"` });
  }

  headers.push({ key: 'Content-Security-Policy-Report-Only', value: policy.join('; ') });
  return headers;
}

module.exports = { getCspHeaders };
