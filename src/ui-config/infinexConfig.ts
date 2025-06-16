import { InfinexConnectConfig, initInfinex } from '@infinex/connect-sdk';

const infinexConfig: InfinexConnectConfig = {
  appKey: 'aave',
  environment: 'dev',
  debug: {
    showLogs: true,
    iframeOptions: {
      shown: true,
      width: '750',
      height: '405',
    },
  },
};
export const infinexConnect = initInfinex(infinexConfig);
