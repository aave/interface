import { useEffect, useState } from 'react';

import { ETH_CORRELATED_SYMBOLS_FALLBACK, STABLECOINS_SYMBOLS_FALLBACK } from './assetCategories';
import { useCoingeckoCategories } from './useCoinGeckoCategories';

export function useAssetCategoryFilters() {
  const { data } = useCoingeckoCategories();

  const [stablecoinSymbols, setStablecoinSymbols] = useState<string[]>(
    STABLECOINS_SYMBOLS_FALLBACK
  );
  const [ethCorrelatedSymbols, setEthCorrelatedSymbols] = useState<string[]>(
    ETH_CORRELATED_SYMBOLS_FALLBACK
  );

  useEffect(() => {
    if (data?.uniqueSymbolsStablecoins && data.uniqueSymbolsStablecoins.length > 0) {
      setStablecoinSymbols(data.uniqueSymbolsStablecoins);
    }
    if (data?.uniqueSymbolsEthCorrelated && data.uniqueSymbolsEthCorrelated.length > 0) {
      setEthCorrelatedSymbols(data.uniqueSymbolsEthCorrelated);
    }
  }, [data]);

  return {
    stablecoinSymbols,
    ethCorrelatedSymbols,
  };
}
