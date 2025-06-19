import { InfinexConnectConfig, initInfinex } from '@infinex/connect-sdk';

const infinexEnv = process.env.NEXT_PUBLIC_INFINEX_ENVIRONMENT;
const isDebug = infinexEnv !== 'prod';

const getCustomBaseUrl = () => {
  if (infinexEnv === 'prod') return;
  if (infinexEnv === 'dev') {
    return 'https://connect.local';
  }

  return `https://connect.${infinexEnv}.infinex.xyz`;
};

const infinexConfig: InfinexConnectConfig = {
  appKey: 'aave',
  connectBaseUrl: getCustomBaseUrl(),
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
