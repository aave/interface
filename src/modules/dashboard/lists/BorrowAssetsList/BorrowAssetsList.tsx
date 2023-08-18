import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { Warning } from 'src/components/primitives/Warning';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { findAndFilterGhoReserve } from 'src/utils/ghoUtilities';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { CapType } from '../../../../components/caps/helper';
import { AvailableTooltip } from '../../../../components/infoTooltips/AvailableTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { Link } from '../../../../components/primitives/Link';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
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
import { GhoBorrowAssetsListItem } from './GhoBorrowAssetsListItem';

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
  {
    title: (
      <StableAPYTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'Stable Borrow APY' },
        }}
        text={<Trans>APY, stable</Trans>}
        key="stableBorrowAPY"
        variant="subheader2"
      />
    ),
    sortKey: 'stableBorrowAPY',
  },
];

export const BorrowAssetsList = () => {
  const { currentNetworkConfig, currentMarketData, currentMarket } = useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd, loading } = useAppDataContext();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const { baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow = reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .map((reserve: ComputedReserveData) => {
      const availableBorrows = user
        ? Number(getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable))
        : 0;

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
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
            ? Number(reserve.stableBorrowAPY)
            : -1,
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
      : tokensToBorrow.filter(
          ({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) =>
            availableBorrowsInUSD !== '0.00' &&
            (totalLiquidityUSD !== '0' ||
              displayGho({
                symbol,
                currentMarket,
              }))
        );

  const { value: ghoReserve, filtered: filteredReserves } = findAndFilterGhoReserve(borrowReserves);
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'asset',
    filteredReserves as unknown as DashboardReserve[]
  );
  const borrowDisabled = !sortedReserves.length && !ghoReserve;

  const RenderHeader = (
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
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Assets to borrow</Trans>
        </Typography>
      }
      localStorageName="borrowAssetsDashboardTableCollapse"
      withTopMargin
      noData={borrowDisabled}
      subChildrenComponent={
        <>
          <Box sx={{ px: 6, mb: 4 }}>
            {borrowDisabled && currentNetworkConfig.name === 'Harmony' && (
              <MarketWarning marketName="Harmony" />
            )}

            {borrowDisabled && currentNetworkConfig.name === 'Fantom' && (
              <MarketWarning marketName="Fantom" />
            )}
            {borrowDisabled && currentMarketData.marketTitle === 'Ethereum AMM' && (
              <MarketWarning marketName="Ethereum AMM" />
            )}

            {+collateralUsagePercent >= 0.98 && (
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
          {ghoReserve && !downToXSM && displayGho({ symbol: ghoReserve.symbol, currentMarket }) && (
            <AssetCapsProvider asset={ghoReserve.reserve}>
              <GhoBorrowAssetsListItem {...ghoReserve} />
            </AssetCapsProvider>
          )}
        </>
      }
    >
      <>
        {!downToXSM && !!borrowReserves.length && RenderHeader}
        {ghoReserve && downToXSM && displayGho({ symbol: ghoReserve.symbol, currentMarket }) && (
          <AssetCapsProvider asset={ghoReserve.reserve}>
            <GhoBorrowAssetsListItem {...ghoReserve} />
          </AssetCapsProvider>
        )}
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
