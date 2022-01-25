import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import BigNumber from 'bignumber.js';
import { useState } from 'react';

import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../../../../hooks/app-data-provider/useWalletBalances';
import { useWeb3Context } from '../../../../libs/hooks/useWeb3Context';
import { getNetworkConfig } from '../../../../utils/marketsAndNetworksConfig';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { SupplyAssetsListItem } from './SupplyAssetsListItem';

export const SupplyAssetsList = () => {
  const { currentAccount, chainId } = useWeb3Context();
  const { user, reserves, marketReferencePriceInUsd } = useAppDataContext();
  const { walletBalances } = useWalletBalances();

  const {
    bridge,
    name: networkName,
    isTestnet,
    wrappedBaseAssetSymbol,
    baseAssetSymbol,
  } = getNetworkConfig(chainId);

  const localStorageName = 'showSupplyZeroAssets';
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );

  const tokensToSupply = reserves.map((reserve: ComputedReserveData) => {
    const userReserve = user?.userReservesData.find(
      (userRes) => userRes.reserve.symbol === reserve.symbol
    );
    const walletBalance = walletBalances[reserve.underlyingAsset]?.amount;
    const walletBalanceUSD = walletBalances[reserve.underlyingAsset]?.amountUSD;

    let availableToDeposit = valueToBigNumber(walletBalance);
    if (reserve.supplyCap !== '0') {
      availableToDeposit = BigNumber.min(
        availableToDeposit,
        new BigNumber(reserve.supplyCap).minus(reserve.totalLiquidity).multipliedBy('0.995')
      );
    }
    const availableToDepositUSD = valueToBigNumber(availableToDeposit)
      .multipliedBy(reserve.priceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS)
      .toString();

    const isIsolated = reserve.isIsolated;
    const hasDifferentCollateral = user?.userReservesData.find(
      (userRes) => userRes.usageAsCollateralEnabledOnUser && userRes.reserve.id !== reserve.id
    );

    const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
      ? reserve.usageAsCollateralEnabled && (!isIsolated || (isIsolated && !hasDifferentCollateral))
      : !isIsolated
      ? false
      : !hasDifferentCollateral;

    return {
      ...reserve,
      walletBalance,
      walletBalanceUSD,
      availableToDeposit: availableToDeposit.toNumber() <= 0 ? '0' : availableToDeposit.toString(),
      availableToDepositUSD:
        Number(availableToDepositUSD) <= 0 ? '0' : availableToDepositUSD.toString(),
      underlyingBalance: userReserve ? userReserve.underlyingBalance : '0',
      underlyingBalanceInUSD: userReserve ? userReserve.underlyingBalanceUSD : '0',
      liquidityRate: reserve.supplyAPY,
      borrowingEnabled: reserve.borrowingEnabled,
      interestHistory: [],
      aIncentives: reserve.aIncentivesData ? reserve.aIncentivesData : [],
      vIncentives: reserve.vIncentivesData ? reserve.vIncentivesData : [],
      sIncentives: reserve.sIncentivesData ? reserve.sIncentivesData : [],
      usageAsCollateralEnabledOnUser,
      priceInMarketReferenceCurrency: reserve.priceInMarketReferenceCurrency,
    };
  });

  const wrappedAsset = tokensToSupply.find(
    (token) => token.symbol.toLowerCase() === wrappedBaseAssetSymbol?.toLowerCase()
  );
  if (wrappedAsset) {
    let availableToDeposit = valueToBigNumber(
      walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount
    );
    if (wrappedAsset.supplyCap !== '0') {
      availableToDeposit = BigNumber.min(
        availableToDeposit,
        new BigNumber(wrappedAsset.supplyCap)
          .minus(wrappedAsset.totalLiquidity)
          .multipliedBy('0.995')
      );
    }
    const availableToDepositUSD = valueToBigNumber(availableToDeposit)
      .multipliedBy(wrappedAsset.priceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS)
      .toString();
    tokensToSupply.push({
      ...wrappedAsset,
      underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
      symbol: baseAssetSymbol,
      walletBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
      walletBalanceUSD: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
      availableToDeposit: availableToDeposit.toString(),
      availableToDepositUSD,
    });
  }

  const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
    +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1
  );
  const filteredSupplyReserves = sortedSupplyReserves.filter(
    (reserve) => reserve.availableToDepositUSD !== '0'
  );

  if (!sortedSupplyReserves.length) return null;

  const supplyReserves = isShowZeroAssets
    ? sortedSupplyReserves
    : filteredSupplyReserves.length >= 1
    ? filteredSupplyReserves
    : sortedSupplyReserves;

  return (
    <DashboardListWrapper
      title={<Trans>Assets to supply</Trans>}
      localStorageName="supplyAssetsDashboardTableCollapse"
      withBottomText={isTestnet}
      withTopMargin
    >
      {supplyReserves.map((item) => (
        <SupplyAssetsListItem {...item} key={item.id} />
      ))}
    </DashboardListWrapper>
  );
};
