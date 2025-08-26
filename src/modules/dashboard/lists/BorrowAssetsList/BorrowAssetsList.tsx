import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { MarketAssetCategoryFilter } from 'src/components/MarketAssetCategoryFilter';
import { Warning } from 'src/components/primitives/Warning';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { AssetCategory, isAssetInCategoryDynamic } from 'src/modules/markets/utils/assetCategories';
import { useCoinGeckoEthCorrelatedCat } from 'src/modules/markets/utils/useCoinGeckoEthCorrelatedCat';
import { useCoinGeckoStablecoinCat } from 'src/modules/markets/utils/useCoinGeckoStablecoinCat';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GENERAL } from 'src/utils/events';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { CapType } from '../../../../components/caps/helper';
import { AvailableTooltip } from '../../../../components/infoTooltips/AvailableTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link } from '../../../../components/primitives/Link';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from '../../../../utils/getMaxAmountAvailableToBorrow';
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
  const { stablecoinSymbols } = useCoinGeckoStablecoinCat();
  const { ethCorrelatedSymbols } = useCoinGeckoEthCorrelatedCat();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(AssetCategory.ALL);

  const [currentNetworkConfig, currentMarket] = useRootStore(
    useShallow((store) => [store.currentNetworkConfig, store.currentMarket])
  );
  const { user, reserves, marketReferencePriceInUsd, loading } = useAppDataContext();
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
    .filter((reserve) => (user ? assetCanBeBorrowedByUser(reserve, user) : false))
    // filter by category
    .filter((res) =>
      isAssetInCategoryDynamic(
        res.symbol,
        selectedCategory,
        stablecoinSymbols,
        ethCorrelatedSymbols
      )
    )
    .map((reserve: ComputedReserveData) => {
      const availableBorrows = user ? Number(getMaxAmountAvailableToBorrow(reserve, user)) : 0;

      const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
        .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
        .multipliedBy(marketReferencePriceInUsd)
        .shiftedBy(-USD_DECIMALS)
        .toFixed(2);

      return {
        ...reserve,
        reserve,
        totalBorrows: reserve.totalDebt,
        availableBorrows,
        availableBorrowsInUSD,
        variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
        iconSymbol: reserve.iconSymbol,
        ...(reserve.isWrappedBaseAsset
          ? fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            })
          : {}),
      };
    });

  const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
    user?.availableBorrowsMarketReferenceCurrency || '0'
  );
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '0'
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
        .div(maxBorrowAmount)
        .toFixed();

  const borrowReserves =
    user?.totalCollateralMarketReferenceCurrency === '0' || +collateralUsagePercent >= 0.98
      ? tokensToBorrow
      : tokensToBorrow.filter(({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) => {
          if (displayGhoForMintableMarket({ symbol, currentMarket })) {
            return true;
          }

          return availableBorrowsInUSD !== '0.00' && totalLiquidityUSD !== '0';
        });

  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'asset',
    borrowReserves.sort((a, b) => {
      if (displayGhoForMintableMarket({ symbol: a.symbol, currentMarket })) return -1;
      if (displayGhoForMintableMarket({ symbol: b.symbol, currentMarket })) return 1;
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
          }}
        >
          <Typography component="div" variant="h3" sx={{ flex: '0 0 auto', mr: 2 }}>
            <Trans>Assets to borrow</Trans>
          </Typography>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {!downToXSM && tokensToBorrow.length >= 1 && !isListCollapsed && (
              <MarketAssetCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sx={{
                  buttonGroup: { height: '20px', maxWidth: '220px' },
                  button: { fontSize: '0.7rem' },
                }}
              />
            )}
          </Box>

          <Box sx={{ flex: '0 0 44px' }} />
        </Box>
      }
      onCollapseChange={setIsListCollapsed}
      localStorageName="borrowAssetsDashboardTableCollapse"
      withTopMargin
      noData={borrowDisabled}
      subChildrenComponent={
        <>
          <Box sx={{ px: 6 }}>
            {user?.healthFactor !== '-1' && Number(user?.healthFactor) <= 1.1 && (
              <Warning severity="error">
                <Trans>
                  Be careful - You are very close to liquidation. Consider depositing more
                  collateral or paying down some of your borrowed positions
                </Trans>
              </Warning>
            )}

            {!borrowDisabled && (
              <>
                {user?.isInIsolationMode && (
                  <Warning severity="warning">
                    <Trans>Borrowing power and assets are limited due to Isolation mode. </Trans>
                    <Link href="https://docs.aave.com/faq/" target="_blank" rel="noopener">
                      Learn More
                    </Link>
                  </Warning>
                )}
                {user?.isInEmode && (
                  <Warning severity="warning">
                    <Trans>
                      In E-Mode some assets are not borrowable. Exit E-Mode to get access to all
                      assets
                    </Trans>
                  </Warning>
                )}
                {user?.totalCollateralMarketReferenceCurrency === '0' && (
                  <Warning severity="info">
                    <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
                  </Warning>
                )}
              </>
            )}
          </Box>

          {downToXSM && sortedReserves.length >= 1 && (
            <>
              <Box sx={{ px: 4, pb: 4, pt: '2px' }}>
                {tokensToBorrow.length >= 1 && !isListCollapsed && (
                  <MarketAssetCategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    sx={{
                      buttonGroup: { width: '100%', maxWidth: '100%', height: '30px' },
                      button: { fontSize: '0.7rem' },
                    }}
                  />
                )}
              </Box>
            </>
          )}
        </>
      }
    >
      <>
        {!downToXSM && !!borrowReserves.length && <RenderHeader />}
        {sortedReserves?.map((item) => (
          <Fragment key={item.underlyingAsset}>
            <AssetCapsProvider asset={item.reserve}>
              {downToXSM ? (
                <BorrowAssetsListMobileItem {...item} />
              ) : (
                <BorrowAssetsListItem {...item} />
              )}
            </AssetCapsProvider>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  );
};
