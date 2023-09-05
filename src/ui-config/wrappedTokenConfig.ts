import { ChainId } from '@aave/contract-helpers';

export const wrappedTokenConfig: { [chainId: number]: { [tokenOut: string]: string } } = {
  [ChainId.mainnet]: {
    '0x83f20f44975d03b1b09e64809b757c47f942beea': '0x6b175474e89094c44da98b954eedeac495271d0f', // sDAI -> DAI
  },
};
