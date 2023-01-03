import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GHO_SYMBOL, isGhoAndSupported } from 'src/utils/ghoUtilities';

import { APYTypeTooltip } from '../../../../components/infoTooltips/APYTypeTooltip';
import { BorrowPowerTooltip } from '../../../../components/infoTooltips/BorrowPowerTooltip';
import { TotalBorrowAPYTooltip } from '../../../../components/infoTooltips/TotalBorrowAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardEModeButton } from '../../DashboardEModeButton';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { BorrowedPositionsListMobileItem } from './BorrowedPositionsListMobileItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';
import { GhoBorrowedPositionsListMobileItem } from './GhoBorrowedPositionsListMobileItem';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <Trans key="Debt">Debt</Trans>,
    sortKey: 'variableBorrows',
  },
  {
    title: <Trans key="APY">APY</Trans>,
    sortKey: 'borrowAPY',
  },
  {
    title: <APYTypeTooltip text={<Trans>APY type</Trans>} key="APY type" variant="subheader2" />,
  },
];

export const BorrowedPositionsList = () => {
  const { user, loading, eModes } = useAppDataContext();
  const { currentMarketData, currentNetworkConfig, currentMarket } = useProtocolDataContext();
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const showEModeButton = currentMarketData.v3 && Object.keys(eModes).length > 1;

  let borrowPositions =
    user?.userReservesData.reduce((acc, userReserve) => {
      if (userReserve.variableBorrows !== '0') {
        acc.push({
          ...userReserve,
          borrowRateMode: InterestRate.Variable,
          reserve: {
            ...userReserve.reserve,
            ...(userReserve.reserve.isWrappedBaseAsset
              ? fetchIconSymbolAndName({
                  symbol: currentNetworkConfig.baseAssetSymbol,
                  underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                })
              : {}),
          },
        });
      }
      if (userReserve.stableBorrows !== '0') {
        acc.push({
          ...userReserve,
          borrowRateMode: InterestRate.Stable,
          reserve: {
            ...userReserve.reserve,
            ...(userReserve.reserve.isWrappedBaseAsset
              ? fetchIconSymbolAndName({
                  symbol: currentNetworkConfig.baseAssetSymbol,
                  underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                })
              : {}),
          },
        });
      }
      return acc;
    }, [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[]) || [];

  // Move GHO to top of borrowed positions list
  const ghoReserve = borrowPositions.filter((pos) => pos.reserve.symbol === GHO_SYMBOL);
  if (ghoReserve.length > 0) {
    borrowPositions = borrowPositions.filter((pos) => pos.reserve.symbol !== GHO_SYMBOL);
    borrowPositions.unshift(ghoReserve[0]);
  }

  const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
    user?.availableBorrowsMarketReferenceCurrency || '0'
  );
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '0'
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
        .div(maxBorrowAmount)
        .toFixed();

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = borrowPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'position',
    preSortedReserves,
    true
  );

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
    return <ListLoader title={<Trans>Your borrows</Trans>} head={head.map((c) => c.title)} />;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your borrows</Trans>
        </Typography>
      }
      localStorageName="borrowedAssetsDashboardTableCollapse"
      subTitleComponent={
        showEModeButton ? (
          <DashboardEModeButton userEmodeCategoryId={user.userEmodeCategoryId} />
        ) : undefined
      }
      noData={!sortedReserves.length}
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem title={<Trans>Balance</Trans>} value={user?.totalBorrowsUSD || 0} />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={user?.debtAPY || 0}
                percent
                tooltip={<TotalBorrowAPYTooltip />}
              />
              <ListTopInfoItem
                title={<Trans>Borrow power used</Trans>}
                value={collateralUsagePercent || 0}
                percent
                tooltip={<BorrowPowerTooltip />}
              />
            </>
          )}
        </>
      }
    >
      {sortedReserves.length ? (
        <>
          {!downToXSM && <RenderHeader />}
          {sortedReserves.map((item) => (
            <Fragment key={item.underlyingAsset + item.borrowRateMode}>
              <AssetCapsProvider asset={item.reserve}>
                {downToXSM ? (
                  isGhoAndSupported({ symbol: item.reserve.symbol, currentMarket }) ? (
                    <GhoBorrowedPositionsListMobileItem
                      {...item}
                      key={item.underlyingAsset + item.borrowRateMode}
                    />
                  ) : (
                    <BorrowedPositionsListMobileItem
                      {...item}
                      key={item.underlyingAsset + item.borrowRateMode}
                    />
                  )
                ) : isGhoAndSupported({ symbol: item.reserve.symbol, currentMarket }) ? (
                  <GhoBorrowedPositionsListItem
                    {...item}
                    key={item.underlyingAsset + item.borrowRateMode}
                  />
                ) : (
                  <BorrowedPositionsListItem
                    {...item}
                    key={item.underlyingAsset + item.borrowRateMode}
                  />
                )}
              </AssetCapsProvider>
            </Fragment>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
      )}
    </ListWrapper>
  );
};
