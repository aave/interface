import { ChainId } from '@aave/contract-helpers';

interface WrappedTokenConfig {
  tokenIn: string;
  tokenOut: string;
  tokenWrapperContractAddress: string;
}

export const wrappedTokenConfig: { [chainId: number]: { [tokenOut: string]: string } } = {
  [ChainId.mainnet]: {
    '0x83f20f44975d03b1b09e64809b757c47f942beea': '0x6b175474e89094c44da98b954eedeac495271d0f', // sDAI -> DAI
  },
};

// TODO: need to consider v2/v3 markets
export const foo: { [chainId: number]: WrappedTokenConfig } = {
  [ChainId.mainnet]: {
    tokenIn: '0x6B175474E89094C44Da98b954EedeAC495271d0F', //DAI
    tokenOut: '0x83f20f44975d03b1b09e64809b757c47f942beea', //sDAI
    tokenWrapperContractAddress: '0x437f428930669cd06adab2df4a8d4b203ac729c6',
  },
};
