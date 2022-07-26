import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, useMediaQuery, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../../../../hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { DashboardListTopPanel } from '../../DashboardListTopPanel';
import { ListHeader } from '../ListHeader';
import { ListLoader } from '../ListLoader';
import { SupplyAssetsListItem } from './SupplyAssetsListItem';
import { SupplyAssetsListMobileItem } from './SupplyAssetsListMobileItem';

export const SupplyAssetsList = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext();
  const { walletBalances, loading } = useWalletBalances();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { bridge, isTestnet, baseAssetSymbol, name: networkName } = currentNetworkConfig;

  const localStorageName = 'showSupplyZeroAssets';
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );

  const tokensToSupply = reserves
    .filter((reserve: ComputedReserveData) => !reserve.isFrozen)
    .map((reserve: ComputedReserveData) => {
      const walletBalance = walletBalances[reserve.underlyingAsset]?.amount;
      const walletBalanceUSD = walletBalances[reserve.underlyingAsset]?.amountUSD;

      const supplyCapUsage: number =
        reserve.totalLiquidity !== '0' && reserve.supplyCap !== '0'
          ? (parseInt(reserve.totalLiquidity) / parseInt(reserve.supplyCap)) * 100
          : 0;
      const supplyCapReached = supplyCapUsage >= 99.95;

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
        ? reserve.usageAsCollateralEnabled &&
          (!isIsolated || (isIsolated && !hasDifferentCollateral))
        : !isIsolated
        ? false
        : !hasDifferentCollateral;

      if (reserve.isWrappedBaseAsset) {
        let baseAvailableToDeposit = valueToBigNumber(
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount
        );
        if (reserve.supplyCap !== '0') {
          baseAvailableToDeposit = BigNumber.min(
            baseAvailableToDeposit,
            new BigNumber(reserve.supplyCap).minus(reserve.totalLiquidity).multipliedBy('0.995')
          );
        }
        const baseAvailableToDepositUSD = valueToBigNumber(baseAvailableToDeposit)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toString();
        return [
          {
            ...reserve,
            supplyCapReached,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            ...fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            }),
            walletBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
            walletBalanceUSD: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
            availableToDeposit: baseAvailableToDeposit.toString(),
            availableToDepositUSD: baseAvailableToDepositUSD,
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
            id: reserve.id + 'base',
          },
          {
            ...reserve,
            supplyCapReached,
            walletBalance,
            walletBalanceUSD,
            availableToDeposit:
              availableToDeposit.toNumber() <= 0 ? '0' : availableToDeposit.toString(),
            availableToDepositUSD:
              Number(availableToDepositUSD) <= 0 ? '0' : availableToDepositUSD.toString(),
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
          },
        ];
      }

      return {
        ...reserve,
        supplyCapReached,
        walletBalance,
        walletBalanceUSD,
        availableToDeposit:
          availableToDeposit.toNumber() <= 0 ? '0' : availableToDeposit.toString(),
        availableToDepositUSD:
          Number(availableToDepositUSD) <= 0 ? '0' : availableToDepositUSD.toString(),
        usageAsCollateralEnabledOnUser,
        detailsAddress: reserve.underlyingAsset,
      };
    })
    .flat();

  const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
    +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1
  );
  const filteredSupplyReserves = sortedSupplyReserves.filter(
    (reserve) => reserve.availableToDepositUSD !== '0'
  );

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

  if (loadingReserves || loading)
    return <ListLoader title={<Trans>Assets to supply</Trans>} head={head} withTopMargin />;

  let alert = <></>;
  if (filteredSupplyReserves.length === 0) {
    if (isTestnet) {
      alert = (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Trans>Your {networkName} wallet is empty. Get free test assets at </Trans>{' '}
          <Link href={ROUTES.faucet} style={{ fontWeight: 400 }}>
            <Trans>{networkName} Faucet</Trans>
          </Link>
        </Alert>
      );
    } else {
      alert = (
        <Alert severity="info">
          <Trans>Your {networkName} wallet is empty. Purchase or transfer assets</Trans>{' '}
          {bridge && (
            <Trans>
              or use {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your ETH assets.
            </Trans>
          )}
        </Alert>
      );
    }
  }

  return (
    <ListWrapper
      title={<Trans>Assets to supply</Trans>}
      localStorageName="supplyAssetsDashboardTableCollapse"
      withTopMargin
      subChildrenComponent={
        <>
          <Box sx={{ px: 6 }}>
            {user?.isInIsolationMode && (
              <Alert severity="warning">
                <Trans>
                  Collateral usage is limited because of isolation mode.{' '}
                  <Link href="https://docs.aave.com/faq/" target="_blank" rel="noopener">
                    Learn More
                  </Link>
                </Trans>
              </Alert>
            )}
            {alert}
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
        {!downToXSM && <ListHeader head={head} />}
        {supplyReserves.map((item) =>
          downToXSM ? (
            <SupplyAssetsListMobileItem {...item} key={item.id} />
          ) : (
            <SupplyAssetsListItem {...item} key={item.id} />
          )
        )}
      </>
    </ListWrapper>
  );
};
