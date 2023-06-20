declare module '*/locales/en/messages.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ProcessEnv {
    CACHE_PATH: string;
    NEXT_PUBLIC_ENABLE_GOVERNANCE: string;
    NEXT_PUBLIC_ENABLE_STAKING: string;
    NEXT_PUBLIC_ENV: string;
    NEXT_PUBLIC_API_BASEURL: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
    NEXT_PUBLIC_FORK_BASE_CHAIN_ID?: string;
    NEXT_PUBLIC_FORK_CHAIN_ID?: string;
    NEXT_PUBLIC_FORK_URL_RPC?: string;
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: string;
    NEXT_PUBLIC_FIAT_ON_RAMP: string;
  }
}
