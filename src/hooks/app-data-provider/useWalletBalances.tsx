import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';

import { useCMPoolReserves } from '../pool/usePoolReserves';
import { usePoolTokensBalance } from '../pool/usePoolTokensBalance';
import { useProtocolDataContext } from '../useProtocolDataContext';

export interface WalletBalance {
  address: string;
  amount: string;
}

export const useWalletBalances = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { data: balances, isLoading: balancesLoading } = usePoolTokensBalance();
  const { data: poolReserves, isLoading: reservesLoading } = useCMPoolReserves();

  const reserves = poolReserves?.reservesData || [];
  const baseCurrencyData = poolReserves?.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };

  const walletBalances = balances ?? [];
  // process data
  const aggregatedBalance = walletBalances.reduce((acc, reserve) => {
    const poolReserve = reserves.find((poolReserve) => {
      if (reserve.address === API_ETH_MOCK_ADDRESS.toLowerCase()) {
        return (
          poolReserve.symbol.toLowerCase() ===
          currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        );
      }
      return poolReserve.underlyingAsset.toLowerCase() === reserve.address;
    });
    if (poolReserve) {
      acc[reserve.address] = {
        amount: normalize(reserve.amount, poolReserve.decimals),
        amountUSD: nativeToUSD({
          amount: new BigNumber(reserve.amount),
          currencyDecimals: poolReserve.decimals,
          priceInMarketReferenceCurrency: poolReserve.priceInMarketReferenceCurrency,
          marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
          normalizedMarketReferencePriceInUsd: normalize(
            baseCurrencyData.marketReferenceCurrencyPriceInUsd,
            USD_DECIMALS
          ),
        }),
      };
    }
    return acc;
  }, {} as { [address: string]: { amount: string; amountUSD: string } });
  return {
    walletBalances: aggregatedBalance,
    loading: balancesLoading || reservesLoading,
  };
};
