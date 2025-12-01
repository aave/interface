import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';

export type WrappedToken = {
  symbol: string;
  underlyingAsset: string;
  decimals: number;
  priceInUSD: string;
  formattedPriceInMarketReferenceCurrency: string;
};

export type WrappedTokenConfig = {
  tokenIn: WrappedToken;
  tokenOut: WrappedToken;
  tokenWrapperAddress: string;
};

const wrappedTokenConfig: {
  [market: string]: Array<{
    tokenIn: string;
    tokenOut: string;
    tokenWrapperContractAddress: string;
  }>;
} = {
  [CustomMarket.proto_mainnet_v3]: [
    {
      tokenIn: AaveV3Ethereum.ASSETS.DAI.UNDERLYING.toLowerCase(),
      tokenOut: AaveV3Ethereum.ASSETS.sDAI.UNDERLYING.toLowerCase(),
      tokenWrapperContractAddress: AaveV3Ethereum.SAVINGS_DAI_TOKEN_WRAPPER,
    },
  ],
};

export const useWrappedTokens = () => {
  const { supplyReserves } = useAppDataContext(); //! with SDK
  const currentMarket = useRootStore((store) => store.currentMarket);

  if (!supplyReserves || supplyReserves.length === 0) {
    return [];
  }

  const wrappedTokens = wrappedTokenConfig[currentMarket] ?? [];
  let wrappedTokenReserves: WrappedTokenConfig[] = [];

  wrappedTokenReserves = wrappedTokens.map<WrappedTokenConfig>((config) => {
    const tokenInReserve = supplyReserves.find(
      (reserve) => reserve.underlyingToken.address.toLowerCase() === config.tokenIn
    );
    const tokenOutReserve = supplyReserves.find(
      (reserve) => reserve.underlyingToken.address.toLowerCase() === config.tokenOut
    );

    if (!tokenInReserve || !tokenOutReserve) {
      throw new Error('wrapped token reserves not found');
    }

    return {
      tokenIn: {
        symbol: tokenInReserve.underlyingToken.symbol,
        underlyingAsset: tokenInReserve.underlyingToken.address,
        decimals: tokenInReserve.underlyingToken.decimals,
        priceInUSD: tokenInReserve.usdExchangeRate ?? '0',
        formattedPriceInMarketReferenceCurrency: tokenInReserve.usdExchangeRate ?? '0', //!EL base es USD , controlar si funciona
      },
      tokenOut: {
        symbol: tokenOutReserve.underlyingToken.symbol,
        underlyingAsset: tokenOutReserve.underlyingToken.address,
        decimals: tokenOutReserve.underlyingToken.decimals,
        priceInUSD: tokenOutReserve.usdExchangeRate ?? '0',
        formattedPriceInMarketReferenceCurrency: tokenOutReserve.usdExchangeRate ?? '0', //!EL base es USD , controlar si funciona
      },
      tokenWrapperAddress: config.tokenWrapperContractAddress,
    };
  });

  return wrappedTokenReserves;
};
