import { normalize } from '@aave/math-utils';
import { selectCurrentReserves } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';
import { wrappedTokenConfig } from 'src/ui-config/wrappedTokenConfig';
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

export const useWrappedTokens = () => {
  const { marketReferencePriceInUsd, marketReferenceCurrencyDecimals } = useAppDataContext();
  const [reserves, currentChainId] = useRootStore((state) => [
    selectCurrentReserves(state),
    state.currentChainId,
  ]);

  if (!reserves || reserves.length === 0) {
    return [];
  }

  const wrappedTokens = wrappedTokenConfig[currentChainId] ?? [];
  let wrappedTokenReserves: WrappedTokenConfig[] = [];

  console.log(reserves);

  wrappedTokenReserves = wrappedTokens.map<WrappedTokenConfig>((config) => {
    const tokenInReserve = reserves.find(
      (userReserve) => userReserve.underlyingAsset === config.tokenIn.underlyingAsset
    );

    const tokenOutReserve = reserves.find(
      (userReserve) => userReserve.underlyingAsset === config.tokenOut.underlyingAsset
    );

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
        symbol: config.tokenIn.symbol,
        underlyingAsset: config.tokenIn.underlyingAsset,
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
