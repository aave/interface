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
  }
}
