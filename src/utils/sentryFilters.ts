import type { Event } from '@sentry/types';

// Error message patterns to drop. Each regex is tested against
// the first exception value (or the top-level message).
const IGNORED_ERROR_PATTERNS: RegExp[] = [
  // Browser-extension subscription/port noise
  /connection interrupted while trying to subscribe/i,
  /attempting to use a disconnected port object/i,
  /the source .+ has not been authorized yet/i,
  /origin not allowed/i,

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
  /jwt validation error/i,
  /websocket connection failed for host: wss:\/\/relay\.walletconnect\.org/i,
  /no matching key\. session topic doesn't exist/i,
  /proposal expired/i,
  /request expired\. please try again/i,
  /failed to execute 'transaction' on 'idbdatabase': the database connection is closing/i,

  // User rejections
  /userrejectedrequesterror/i,
  /user rejected the request/i,
  /user denied/i,

  // RPC noise from viem buildRequest
  /unknownrpcerror: an unknown rpc error occurred/i,
  /internalrpcerror: an internal error was received/i,

  // Network / browser noise
  /aborterror: signal is aborted without reason/i,
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
  const message = event.exception?.values?.[0]?.value ?? event.message ?? '';
  const culprit = (event as Record<string, unknown>).culprit as string | undefined;
  const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];

  if (IGNORED_ERROR_PATTERNS.some((p) => p.test(message))) return true;

  if (culprit && IGNORED_CULPRIT_PATTERNS.some((p) => p.test(culprit))) return true;

  // Check if the top stack frame comes from an injected script
  const topFrame = frames[frames.length - 1];
  if (topFrame?.filename && IGNORED_CULPRIT_PATTERNS.some((p) => p.test(topFrame.filename!))) {
    return true;
  }

  return false;
}
