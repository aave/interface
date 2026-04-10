import type { Event } from '@sentry/types';

// Error message patterns to drop. Each regex is tested against
// the first exception value (or the top-level message).
const IGNORED_ERROR_PATTERNS: RegExp[] = [
  // Browser-extension subscription/port noise
  /connection interrupted while trying to subscribe/i,
  /attempting to use a disconnected port object/i,
  /the source .+ has not been authorized yet/i,

  // MetaMask / wallet connect failures
  /failed to connect to metamask/i,
  /chrome\.runtime\.sendmessage\(\) called from a webpage must specify an extension id/i,
  /cannot read properties of undefined \(reading 'sendmessage'\)/i,
  /cannot read properties of undefined \(reading 'networkversion'\)/i,
  /cannot read properties of undefined \(reading 'removelistener'\)/i,
  /cannot read properties of undefined \(reading 'ton'\)/i,

  // Wallet injector conflicts (window.ethereum property fights)
  /invalid property descriptor\. cannot both specify accessors and a value or writable attribute/i,
  /cannot set property ethereum of #<window> which has only a getter/i,

  // Specific wallet extensions
  /talisman extension has not been configured yet/i,
  /'set' on proxy: trap returned falsish for property 'tronlinkparams'/i,
  /bitvisionweb is not defined/i,
  /shouldsetpelagusforcurrentprovider is not a function/i,
  /the request by this web3 provider is timeout/i,

  // wagmi / RainbowKit connector noise
  /providernotfounderror: provider not found/i,
  /connectornotconnectederror: connector not connected/i,

  // Cross-origin frame (wallet iframes)
  /blocked a frame with origin .+ from accessing a cross-origin frame/i,

  // WalletConnect
  /websocket connection closed abnormally with code: 3000/i,
  /websocket connection failed for host: wss:\/\/relay\.walletconnect\.org/i,
  /no matching key\. session topic doesn't exist/i,
  /walletconnect.+proposal expired/i,
  /request expired\. please try again/i,
  /failed to execute 'transaction' on 'idbdatabase': the database connection is closing/i,

  // User rejections (wallet-specific patterns)
  /userrejectedrequesterror/i,
  /user rejected the request/i,
  /user rejected transaction/i,
  /user denied transaction signature/i,
  /user denied message signature/i,

  // Contract revert with no reason string (not actionable from frontend)
  /missing revert data in call exception/i,

  // Non-Error null rejections (wallet/provider teardown)
  /non-error promise rejection captured with value: null/i,

  // Network / browser noise
  /can't find variable: eip155/i,
];

// Culprit / stack-frame patterns. These catch errors that have generic
// messages (e.g. "Failed to fetch") but originate from injected scripts.
const IGNORED_CULPRIT_PATTERNS: RegExp[] = [
  /injectLeap/i,
  /inject\.chrome/i,
  /extensionServiceWorker/i,
  /injectedScript\.bundle/i,
  /window-provider/i,
  /injected\/injected/i,
  /frame_ant\/frame_ant/i,
  /\/inpage$/i,
  /\/inject$/i,
  /\/injector$/i,
  /\/btc$/i,
  /\/sui$/i,
  /\/solana$/i,
];

export function shouldIgnoreError(event: Event): boolean {
  const exceptionValue = event.exception?.values?.[0];
  const errorType = exceptionValue?.type ?? '';
  const errorMessage = exceptionValue?.value ?? event.message ?? '';
  // Combine type + message so patterns can match either field.
  // Sentry stores the class name in `type` and the description in `value`,
  // but many wallet errors only populate one of the two.
  const message = errorType ? `${errorType}: ${errorMessage}` : errorMessage;
  const culprit = (event as Record<string, unknown>).culprit as string | undefined;
  const frames = exceptionValue?.stacktrace?.frames ?? [];
  const topFilename = frames.length > 0 ? frames[frames.length - 1]?.filename : undefined;

  // Unconditional message-based filters (safe regardless of source)
  if (IGNORED_ERROR_PATTERNS.some((p) => p.test(message))) return true;

  const isFromInjectedScript =
    (culprit != null && IGNORED_CULPRIT_PATTERNS.some((p) => p.test(culprit))) ||
    (topFilename != null && IGNORED_CULPRIT_PATTERNS.some((p) => p.test(topFilename)));

  // Drop any error whose stack originates from an injected script
  if (isFromInjectedScript) return true;

  return false;
}
