import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { Fragment, useState } from 'react';
import { AssetCategoryMultiSelect } from 'src/components/AssetCategoryMultiselect';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { Warning } from 'src/components/primitives/Warning';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useCoingeckoCategories } from 'src/hooks/useCoinGeckoCategories';
import { useWrappedTokens } from 'src/hooks/useWrappedTokens';
import { AssetCategory, isAssetInCategoryDynamic } from 'src/modules/markets/utils/assetCategories';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DASHBOARD } from 'src/utils/events';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../../../../hooks/app-data-provider/useWalletBalances';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { DashboardListTopPanel } from '../../DashboardListTopPanel';
import { isAssetHidden } from '../constants';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { SupplyAssetsListItem } from './SupplyAssetsListItem';
import { WalletEmptyInfo } from './WalletEmptyInfo';

const head = [
  { title: <Trans key="assets">Assets</Trans>, sortKey: 'symbol' },
  { title: <Trans key="Wallet balance">Wallet balance</Trans>, sortKey: 'walletBalance' },
  { title: <Trans key="APY">APY</Trans>, sortKey: 'supplyAPY' },
  {
    title: <Trans key="Can be collateral">Can be collateral</Trans>,
    sortKey: 'usageAsCollateralEnabledOnUser',
  },
];

export const SupplyAssetsList = () => {
  const { data, isLoading, error } = useCoingeckoCategories();
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);

  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext();
  const wrappedTokenReserves = useWrappedTokens();
  const { walletBalances, loading } = useWalletBalances(currentMarketData);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { bridge, isTestnet, baseAssetSymbol, name: networkName } = currentNetworkConfig;

  const localStorageName = 'showSupplyZeroAssets';
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );
  const listCollapseKey = 'supplyAssetsDashboardTableCollapse';
  const [isListCollapsed, setIsListCollapsed] = useState(
    localStorage.getItem(listCollapseKey) === 'true'
  );

  const tokensToSupply = reserves
    .filter(
      (reserve: ComputedReserveData) =>
        !(reserve.isFrozen || reserve.isPaused) &&
        !displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket }) &&
        !isAssetHidden(currentMarketData.market, reserve.underlyingAsset)
    )
    // filter by category
    .filter(
      (res) =>
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          isAssetInCategoryDynamic(
            res.symbol,
            category,
            data?.stablecoinSymbols,
            data?.ethCorrelatedSymbols
          )
        )
    )

    .map((reserve: ComputedReserveData) => {
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
        ? reserve.reserveLiquidationThreshold !== '0' &&
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
            reserve,
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
            reserve,
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
        reserve,
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

  const filteredSupplyReserves = sortedSupplyReserves.filter((reserve) => {
    // Filter out dust amounts < $0.01 USD
    if (reserve.availableToDepositUSD !== '0' && Number(reserve.availableToDepositUSD) >= 0.01) {
      return true;
    }

    const wrappedTokenConfig = wrappedTokenReserves.find(
      (r) => r.tokenOut.underlyingAsset === reserve.underlyingAsset
    );

    if (!wrappedTokenConfig) {
      return false;
    }

    // The asset can be supplied if the user has a 'token in' balance, (DAI as sDAI for example)
    const wrappedBalance = walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset]?.amount;
    const wrappedBalanceUSD = walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset]?.amountUSD;

    return wrappedBalance !== '0' && Number(wrappedBalanceUSD || '0') >= 0.01;
  });

  // Filter out reserves
  const supplyReserves: unknown = isShowZeroAssets
    ? sortedSupplyReserves
    : filteredSupplyReserves.length >= 1
    ? filteredSupplyReserves
    : sortedSupplyReserves;

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = supplyReserves as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'assets',
    preSortedReserves
  );

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET : undefined}
            key={col.sortKey}
            overFlow={'visible'}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source="Supplies Dashbaord"
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    );
  };

  if (loadingReserves || loading)
    return (
      <ListLoader
        head={head.map((col) => col.title)}
        title={<Trans>Assets to supply</Trans>}
        withTopMargin
      />
    );

  const supplyDisabled = !tokensToSupply.length;

  return (
    <ListWrapper
      titleComponent={
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            mr: 2,
          }}
        >
          <Typography component="div" variant="h3" sx={{ flex: '0 0 auto', mr: 2 }}>
            <Trans>Assets to supply</Trans>
          </Typography>

          {!downToXSM && !isListCollapsed && (
            <AssetCategoryMultiSelect
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              disabled={isLoading || !!error}
            />
          )}
        </Box>
      }
      onCollapseChange={setIsListCollapsed}
      localStorageName="supplyAssetsDashboardTableCollapse"
      withTopMargin
      noData={supplyDisabled}
      subChildrenComponent={
        <>
          {downToXSM && !isListCollapsed && (
            <Box sx={{ px: 4, pb: 2, pt: '2px' }}>
              <AssetCategoryMultiSelect
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                disabled={isLoading || !!error}
                sx={{
                  buttonGroup: { width: '100%', maxWidth: '100%', height: '30px' },
                  button: { fontSize: '0.7rem' },
                }}
              />
            </Box>
          )}
          <Box sx={{ px: 6 }}>
            {user?.isInIsolationMode ? (
              <Warning severity="warning">
                <Trans>
                  Collateral usage is limited because of isolation mode.{' '}
                  <Link href="https://docs.aave.com/faq/" target="_blank" rel="noopener">
                    Learn More
                  </Link>
                </Trans>
              </Warning>
            ) : (
              filteredSupplyReserves.length === 0 &&
              !supplyDisabled &&
              (isTestnet ? (
                <Warning severity="info">
                  <Trans>Your {networkName} wallet is empty. Get free test assets at </Trans>{' '}
                  <Link href={ROUTES.faucet} style={{ fontWeight: 400 }}>
                    <Trans>{networkName} Faucet</Trans>
                  </Link>
                </Warning>
              ) : (
                <WalletEmptyInfo name={networkName} bridge={bridge} chainId={currentChainId} />
              ))
            )}
            {supplyDisabled && (
              <Warning severity="info">
                <Trans>
                  We couldn&apos;t find any assets related to your search. Try again with a
                  different category.
                </Trans>
              </Warning>
            )}
          </Box>

          {filteredSupplyReserves.length >= 1 && (
            <>
              <DashboardListTopPanel
                value={isShowZeroAssets}
                onClick={setIsShowZeroAssets}
                localStorageName={localStorageName}
                bridge={bridge}
                eventName={DASHBOARD.SHOW_ASSETS_0_BALANCE}
                label={<Trans>Show assets with 0 balance</Trans>}
                showFaucet={STAGING_ENV || ENABLE_TESTNET}
                showBridge={!ENABLE_TESTNET}
              />
            </>
          )}
        </>
      }
    >
      <>
        {!downToXSM && !!sortedReserves && !supplyDisabled && <RenderHeader />}
        {sortedReserves.map((item) => (
          <Fragment key={item.underlyingAsset}>
            <AssetCapsProvider asset={item.reserve}>
              <SupplyAssetsListItem {...item} key={item.id} walletBalances={walletBalances} />
            </AssetCapsProvider>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  );
};
