import { InfinexConnectConfig, initInfinex } from '@infinex/connect-sdk';

const infinexEnv = process.env.NEXT_PUBLIC_INFINEX_ENVIRONMENT;
const isDebug = infinexEnv !== 'prod';
const infinexConfig: InfinexConnectConfig = {
  appKey: 'aave',
  environment: infinexEnv,
  debug: {
    showLogs: isDebug,
    iframeOptions: {
      shown: isDebug,
      width: '750',
      height: '405',
    },
  },
};
export const infinexConnect = initInfinex(infinexConfig);
