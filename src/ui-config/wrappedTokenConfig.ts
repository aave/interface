import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';

export const wrappedTokenConfig: { [chainId: number]: { [tokenOut: string]: string } } = {
  [ChainId.mainnet]: {
    [AaveV3Ethereum.ASSETS.sDAI.UNDERLYING.toLowerCase()]:
      AaveV3Ethereum.ASSETS.DAI.UNDERLYING.toLowerCase(),
  },
};
