import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';

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
        underlyingAsset: AaveV3Ethereum.ASSETS.DAI.UNDERLYING.toLowerCase(),
        symbol: 'DAI',
      },
      tokenOut: {
        underlyingAsset: AaveV3Ethereum.ASSETS.sDAI.UNDERLYING.toLowerCase(),
        symbol: 'sDAI',
      },
      tokenWrapperContractAddress: AaveV3Ethereum.SAVINGS_DAI_TOKEN_WRAPPER,
    },
  ],
};
