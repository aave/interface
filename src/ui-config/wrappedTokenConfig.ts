import { ChainId } from '@aave/contract-helpers';

interface WrappedTokenConfig {
  tokenIn: Token;
  tokenOut: Token;
  tokenWrapperContractAddress: string;
}

interface Token {
  underlyingAsset: string;
  symbol: string;
  decimals?: number;
}

export const wrappedTokenConfig: { [chainId: number]: WrappedTokenConfig[] } = {
  [ChainId.mainnet]: [
    {
      tokenIn: {
        underlyingAsset: '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
        symbol: 'DAI',
      },
      tokenOut: {
        underlyingAsset: '0x83f20f44975d03b1b09e64809b757c47f942beea'.toLowerCase(),
        symbol: 'sDAI',
      },
      tokenWrapperContractAddress: '0x5d4d4007a4c6336550ddaa2a7c0d5e7972eebd16',
    },
  ],
};
