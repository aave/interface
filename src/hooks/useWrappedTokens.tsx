import { normalize } from '@aave/math-utils';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { amountToUsd } from 'src/utils/utils';

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
  const { marketReferencePriceInUsd, marketReferenceCurrencyDecimals, reserves } =
    useAppDataContext();
  const currentMarket = useRootStore((store) => store.currentMarket);

  if (!reserves || reserves.length === 0) {
    return [];
  }

  const wrappedTokens = wrappedTokenConfig[currentMarket] ?? [];
  let wrappedTokenReserves: WrappedTokenConfig[] = [];

  wrappedTokenReserves = wrappedTokens.map<WrappedTokenConfig>((config) => {
    const tokenInReserve = reserves.find((reserve) => reserve.underlyingAsset === config.tokenIn);
    const tokenOutReserve = reserves.find((reserve) => reserve.underlyingAsset === config.tokenOut);

    if (!tokenInReserve || !tokenOutReserve) {
      throw new Error('wrapped token reserves not found');
    }

    const tokenInFormattedPriceInMarketReferenceCurrency = normalize(
      tokenInReserve.priceInMarketReferenceCurrency,
      marketReferenceCurrencyDecimals
    );

    const tokenOutFormattedPriceInMarketReferenceCurrency = normalize(
      tokenOutReserve.priceInMarketReferenceCurrency,
      marketReferenceCurrencyDecimals
    );

    return {
      tokenIn: {
        symbol: tokenInReserve.symbol,
        underlyingAsset: tokenInReserve.underlyingAsset,
        decimals: tokenInReserve.decimals,
        priceInUSD: amountToUsd(
          1,
          tokenInFormattedPriceInMarketReferenceCurrency,
          marketReferencePriceInUsd
        ).toString(),
        formattedPriceInMarketReferenceCurrency: tokenInFormattedPriceInMarketReferenceCurrency,
      },
      tokenOut: {
        symbol: tokenOutReserve.symbol,
        underlyingAsset: tokenOutReserve.underlyingAsset,
        decimals: tokenOutReserve.decimals,
        priceInUSD: amountToUsd(
          1,
          tokenOutFormattedPriceInMarketReferenceCurrency,
          marketReferencePriceInUsd
        ).toString(),
        formattedPriceInMarketReferenceCurrency: tokenOutFormattedPriceInMarketReferenceCurrency,
      },
      tokenWrapperAddress: config.tokenWrapperContractAddress,
    };
  });

  return wrappedTokenReserves;
};
