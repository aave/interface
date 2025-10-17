import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { AssetCategoryMultiSelect } from 'src/components/AssetCategoryMultiselect';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { Warning } from 'src/components/primitives/Warning';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
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
  ReserveWithId,
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
  const { loading: loadingReserves, supplyReserves: reservesSDK, userState } = useAppDataContext();

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

  const tokensToSupply = reservesSDK
    .filter(
      (reserve: ReserveWithId) =>
        !(reserve.isFrozen || reserve.isPaused) &&
        !displayGhoForMintableMarket({ symbol: reserve.underlyingToken.symbol, currentMarket }) &&
        !isAssetHidden(currentMarketData.market, reserve.underlyingToken.address)
    )
    // filter by category
    .filter(
      (res) =>
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          isAssetInCategoryDynamic(
            res.underlyingToken.symbol,
            category,
            data?.stablecoinSymbols,
            data?.ethCorrelatedSymbols
          )
        )
    )
    .sort((a, b) => {
      const aSize = Number(a?.size?.usd || '0');
      const bSize = Number(b?.size?.usd || '0');
      return bSize - aSize;
    })
    .map((reserve: ReserveWithId) => {
      const walletBalance = reserve.userState?.balance.amount.value;
      const walletBalanceUSD = reserve.userState?.balance.usd;
      const availableToDeposit = reserve.userState?.suppliable.amount.value;
      const availableToDepositUSD = reserve.userState?.suppliable.usd;
      const usageAsCollateralEnabledOnUser = reserve.userState?.canBeCollateral ?? false;

      if (reserve.acceptsNative !== null) {
        const baseAvailableToDeposit =
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0';
        const baseAvailableToDepositUSD =
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD || '0';
        return [
          {
            ...reserve,
            reserve,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            ...fetchIconSymbolAndName({
              symbol: baseAssetSymbol.toUpperCase(),
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            }),
            walletBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
            walletBalanceUSD: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD || '0',
            availableToDeposit: baseAvailableToDeposit.toString(),
            availableToDepositUSD: baseAvailableToDepositUSD.toString(),
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingToken.address,
            id: reserve.id + 'base',
            supplyAPY: Number(reserve.supplyInfo.apy.value),
          },
          {
            ...reserve,
            reserve,
            walletBalance,
            walletBalanceUSD,
            availableToDeposit,
            availableToDepositUSD,
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingToken.address,
          },
        ];
      }

      return {
        ...reserve,
        reserve,
        walletBalance,
        walletBalanceUSD,
        availableToDeposit,
        availableToDepositUSD,
        usageAsCollateralEnabledOnUser,
        supplyAPY: Number(reserve.supplyInfo.apy.value),
        detailsAddress: reserve.underlyingToken.address,
      };
    })
    .flat();

  const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
    +a.walletBalanceUSD! > +b.walletBalanceUSD! ? -1 : 1
  );

  const filteredSupplyReserves = sortedSupplyReserves.filter((reserve) => {
    // Filter out dust amounts < $0.01 USD
    if (reserve.availableToDepositUSD !== '0' && Number(reserve.availableToDepositUSD) >= 0.01) {
      return true;
    }

    const wrappedTokenConfig = wrappedTokenReserves.find(
      (r) =>
        r.tokenOut.underlyingAsset.toLowerCase() === reserve.underlyingToken.address.toLowerCase()
    );

    if (!wrappedTokenConfig) {
      return false;
    }

    // The asset can be supplied if the user has a 'token in' balance, (DAI as sDAI for example)
    const wrappedBalance =
      walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset.toLowerCase()]?.amount;
    const wrappedBalanceUSD =
      walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset.toLowerCase()]?.amountUSD;

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
            {userState?.isInIsolationMode ? (
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
            <AssetCapsProviderSDK asset={item.reserve}>
              <SupplyAssetsListItem {...item} key={item.id} walletBalances={walletBalances} />
            </AssetCapsProviderSDK>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  );
};
