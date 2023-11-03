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

// TODO: need to consider v2/v3 markets
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
      tokenWrapperContractAddress: '0x437f428930669cd06adab2df4a8d4b203ac729c6',
    },
    {
      tokenIn: {
        decimals: 18,
        underlyingAsset: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'.toLowerCase(),
        symbol: 'stETH',
      },
      tokenOut: {
        underlyingAsset: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'.toLowerCase(),
        symbol: 'wstETH',
      },
      tokenWrapperContractAddress: '0x14aa09449fac437b5c0110614be2c08610e38f62',
    },
  ],
};
