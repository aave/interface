import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';

export interface V4Rates {
  supplyApy?: number;
  borrowApy?: number;
}

const MOCK_V4_RATES: Partial<Record<ChainId, Record<string, V4Rates>>> = {
  [ChainId.mainnet]: {
    [AaveV3Ethereum.ASSETS.WETH.UNDERLYING.toLowerCase()]: { supplyApy: 0.0318, borrowApy: 0.0112 },
    [AaveV3Ethereum.ASSETS.weETH.UNDERLYING.toLowerCase()]: {
      supplyApy: 0.0184,
      borrowApy: 0.0074,
    },
    [AaveV3Ethereum.ASSETS.WBTC.UNDERLYING.toLowerCase()]: { supplyApy: 0.0152, borrowApy: 0.0022 },
    [AaveV3Ethereum.ASSETS.USDT.UNDERLYING.toLowerCase()]: { supplyApy: 0.0494, borrowApy: 0.0185 },
    [AaveV3Ethereum.ASSETS.USDC.UNDERLYING.toLowerCase()]: { supplyApy: 0.0543, borrowApy: 0.0214 },
    [AaveV3Ethereum.ASSETS.cbBTC.UNDERLYING.toLowerCase()]: {
      supplyApy: 0.0167,
      borrowApy: 0.0018,
    },
  },
};

export const useV4Rates = (chainId: ChainId): Record<string, V4Rates> =>
  MOCK_V4_RATES[chainId] ?? {};
