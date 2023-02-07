import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { useRootStore } from 'src/store/root';

import { selectCurrentBaseCurrencyData, selectCurrentReserves } from '../../store/poolSelectors';
import { selectCurrentWalletBalances } from '../../store/walletSelectors';
import { useProtocolDataContext } from '../useProtocolDataContext';

export interface WalletBalance {
  address: string;
  amount: string;
}

export const useWalletBalances = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const [balances, reserves, baseCurrencyData] = useRootStore((state) => [
    selectCurrentWalletBalances(state),
    selectCurrentReserves(state),
    selectCurrentBaseCurrencyData(state),
  ]);

  // process data
  const walletBalances = balances || [];
  let hasEmptyWallet = true;
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
    if (reserve.amount !== '0') hasEmptyWallet = false;
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
    hasEmptyWallet,
    loading: !walletBalances.length || !reserves.length,
  };
};
