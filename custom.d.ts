declare module '*/locales/en/messages.js';
declare module 'ua-parser-js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ProcessEnv {
    CACHE_PATH: string;
    NEXT_PUBLIC_ENABLE_GOVERNANCE: string;
    NEXT_PUBLIC_ENABLE_STAKING: string;
  }
}
