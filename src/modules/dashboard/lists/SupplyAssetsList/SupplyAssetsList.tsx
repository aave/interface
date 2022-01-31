import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useState } from 'react';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link } from '../../../../components/primitives/Link';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../../../../hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { DashboardListTopPanel } from '../../DashboardListTopPanel';
import { ListBottomText } from '../ListBottomText';
import { ListHeader } from '../ListHeader';
import { SupplyAssetsListItem } from './SupplyAssetsListItem';

export const SupplyAssetsList = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd } = useAppDataContext();
  const { walletBalances } = useWalletBalances();

  const {
    bridge,
    isTestnet,
    wrappedBaseAssetSymbol,
    baseAssetSymbol,
    name: networkName,
  } = currentNetworkConfig;

  const localStorageName = 'showSupplyZeroAssets';
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );

  const tokensToSupply = reserves.map((reserve: ComputedReserveData) => {
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
      liquidityRate: reserve.supplyAPY,
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

  const head = [
    <Trans key="Wallet balance">Wallet balance</Trans>,
    <Trans key="APY">APY</Trans>,
    <Trans key="Can be collateral">Can be collateral</Trans>,
  ];

  return (
    <ListWrapper
      title={<Trans>Assets to supply</Trans>}
      localStorageName="supplyAssetsDashboardTableCollapse"
      bottomComponent={isTestnet ? <ListBottomText /> : undefined}
      withTopMargin
      subChildrenComponent={
        <>
          <Box sx={{ px: 6 }}>
            {user?.isInIsolationMode && (
              <Alert severity="warning">
                <Trans>Collateral usage is limited because of isolation mode.</Trans>
              </Alert>
            )}
            {filteredSupplyReserves.length === 0 && (
              <Alert severity="info">
                {/* TODO: need to add <Trans></Trans> */}
                <>Your {networkName} wallet is empty. To deposit ...</>
                {bridge && (
                  <>
                    Or use {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your ETH
                    assets.
                  </>
                )}
              </Alert>
            )}
          </Box>

          {filteredSupplyReserves.length >= 1 && (
            <DashboardListTopPanel
              value={isShowZeroAssets}
              onClick={setIsShowZeroAssets}
              localStorageName={localStorageName}
              bridge={bridge}
            />
          )}
        </>
      }
    >
      <>
        <ListHeader head={head} />
        {supplyReserves.map((item, index) => (
          <SupplyAssetsListItem {...item} key={index} />
        ))}
      </>
    </ListWrapper>
  );
};
