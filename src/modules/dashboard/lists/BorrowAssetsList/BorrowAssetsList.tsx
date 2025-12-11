import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { AssetCategoryMultiSelect } from 'src/components/AssetCategoryMultiselect';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { Warning } from 'src/components/primitives/Warning';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
import { useCoingeckoCategories } from 'src/hooks/useCoinGeckoCategories';
import { AssetCategory, isAssetInCategoryDynamic } from 'src/modules/markets/utils/assetCategories';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GENERAL } from 'src/utils/events';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/react/shallow';

import { CapType } from '../../../../components/caps/helper';
import { AvailableTooltip } from '../../../../components/infoTooltips/AvailableTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link } from '../../../../components/primitives/Link';
import {
  ReserveWithId,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { isAssetHidden } from '../constants';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { BorrowAssetsListItem } from './BorrowAssetsListItem';
import { BorrowAssetsListMobileItem } from './BorrowAssetsListMobileItem';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: (
      <AvailableTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'Available to borrow' },
        }}
        capType={CapType.borrowCap}
        text={<Trans>Available</Trans>}
        key="availableBorrows"
        variant="subheader2"
      />
    ),
    sortKey: 'availableBorrows',
  },

  {
    title: (
      <VariableAPYTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'Variable Borrow APY' },
        }}
        text={<Trans>APY, variable</Trans>}
        key="variableBorrowAPY"
        variant="subheader2"
      />
    ),
    sortKey: 'variableBorrowAPY',
  },
];

export const BorrowAssetsList = () => {
  const { data, isLoading, error } = useCoingeckoCategories();
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);
  const [currentNetworkConfig, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [
      store.currentNetworkConfig,
      store.currentMarketData,
      store.currentMarket,
    ])
  );

  const { borrowReserves: reserves, loading, userState } = useAppDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const listCollapseKey = 'borrowAssetsDashboardTableCollapse';
  const [isListCollapsed, setIsListCollapsed] = useState(
    localStorage.getItem(listCollapseKey) === 'true'
  );

  const { baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow = reserves
    .filter(
      (reserve: ReserveWithId) =>
        !(reserve.isFrozen || reserve.isPaused) &&
        !isAssetHidden(currentMarketData.market, reserve.underlyingToken.address) &&
        (reserve.borrowInfo?.borrowCap.amount.value === '0' ||
          Number(reserve.borrowInfo?.total?.amount.value || '0') <
            Number(reserve.borrowInfo?.borrowCap.amount.value || '0'))
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
      const availableBorrows = reserve.userState?.borrowable.amount.value || '0';
      const availableBorrowsInUSD = reserve.userState?.borrowable.usd || '0';

      return {
        ...reserve,
        reserve,
        totalBorrows: reserve.borrowInfo?.total?.amount.value || '0',
        availableBorrows: Number(availableBorrows),
        availableBorrowsInUSD,
        variableBorrowRate:
          reserve.borrowInfo?.borrowingState === 'ENABLED'
            ? Number(reserve.borrowInfo?.apy.value || '0')
            : -1,
        totalLiquidityUSD: reserve.size?.usd || '0',
        variableBorrowAPY: Number(reserve.borrowInfo?.apy.value || '0'),
        ...(reserve.acceptsNative
          ? fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            })
          : {}),
      };
    });

  const maxBorrowAmount =
    Number(userState?.availableBorrowsBase || '0') + Number(userState?.totalDebtBase || '0');
  const collateralUsagePercent =
    maxBorrowAmount === 0
      ? '0'
      : (Number(userState?.totalDebtBase || '0') / maxBorrowAmount).toFixed(2);

  const borrowReserves =
    Number(userState?.totalCollateralBase || '0') === 0 || +collateralUsagePercent >= 0.98
      ? tokensToBorrow
      : tokensToBorrow.filter(({ availableBorrowsInUSD, totalLiquidityUSD, symbol, reserve }) => {
          if (
            displayGhoForMintableMarket({
              symbol: symbol || reserve.underlyingToken.symbol,
              currentMarket,
            })
          ) {
            return true;
          }

          return (
            availableBorrowsInUSD !== '0.00' &&
            Number(availableBorrowsInUSD) > 0 &&
            totalLiquidityUSD !== '0'
          );
        });

  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'asset',
    borrowReserves.sort((a, b) => {
      if (displayGhoForMintableMarket({ symbol: a.underlyingToken.symbol, currentMarket }))
        return -1;
      if (displayGhoForMintableMarket({ symbol: b.underlyingToken.symbol, currentMarket }))
        return 1;
      return 0;
    }) as unknown as DashboardReserve[]
  );
  const borrowDisabled = !sortedReserves.length;

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET : undefined}
            key={col.sortKey}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source={'Borrow Dashboard'}
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    );
  };

  if (loading)
    return (
      <ListLoader
        title={<Trans>Assets to borrow</Trans>}
        head={head.map((col) => col.title)}
        withTopMargin
      />
    );

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
            <Trans>Assets to borrow</Trans>
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
      localStorageName="borrowAssetsDashboardTableCollapse"
      withTopMargin
      noData={borrowDisabled}
      subChildrenComponent={
        <>
          {downToXSM && (
            <>
              <Box sx={{ px: 4, pb: 4, pt: '2px' }}>
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
            </>
          )}
          <Box sx={{ px: 6 }}>
            {userState?.healthFactor !== null &&
              userState?.healthFactor !== undefined &&
              Number(userState.healthFactor) !== -1 &&
              Number(userState.healthFactor) <= 1.1 && (
                <Warning severity="error">
                  <Trans>
                    Be careful - You are very close to liquidation. Consider depositing more
                    collateral or paying down some of your borrowed positions
                  </Trans>
                </Warning>
              )}

            {!borrowDisabled && (
              <>
                {userState?.isInIsolationMode && (
                  <Warning severity="warning">
                    <Trans>Borrowing power and assets are limited due to Isolation mode. </Trans>
                    <Link href="https://docs.aave.com/faq/" target="_blank" rel="noopener">
                      Learn More
                    </Link>
                  </Warning>
                )}
                {userState?.eModeEnabled && (
                  <Warning severity="warning">
                    <Trans>
                      In E-Mode some assets are not borrowable. Exit E-Mode to get access to all
                      assets
                    </Trans>
                  </Warning>
                )}
                {Number(userState?.totalCollateralBase || '0') === 0 && (
                  <Warning severity="info">
                    <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
                  </Warning>
                )}
              </>
            )}
            {borrowDisabled && (
              <Warning severity="info">
                <Trans>
                  We couldn&apos;t find any assets related to your search. Try again with a
                  different category.
                </Trans>
              </Warning>
            )}
          </Box>
        </>
      }
    >
      <>
        {!downToXSM && !!borrowReserves.length && <RenderHeader />}
        {sortedReserves?.map((item) => (
          <Fragment key={item.underlyingAsset}>
            <AssetCapsProviderSDK asset={item.reserve}>
              {downToXSM ? (
                <BorrowAssetsListMobileItem {...item} />
              ) : (
                <BorrowAssetsListItem {...item} />
              )}
            </AssetCapsProviderSDK>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  );
};
