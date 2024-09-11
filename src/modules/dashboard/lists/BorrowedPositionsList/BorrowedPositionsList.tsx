import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { MoneyIcon } from 'src/components/icons/MoneyIcon';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { GENERAL } from 'src/utils/mixPanelEvents';

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
import { BorrowedPositionsListItemWrapper } from './BorrowedPositionsListItemWrapper';

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
    title: (
      <APYTypeTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'APY Type Borrow' },
        }}
        text={<Trans>APY type</Trans>}
        key="APY type"
        variant="subheader2"
      />
    ),
    sortKey: 'typeAPY',
  },
];

export const BorrowedPositionsList = () => {
  const { user, loading, eModes } = useAppDataContext();
  const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const showEModeButton = currentMarketData.v3 && Object.keys(eModes).length > 1;
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const { isConnectedTonWallet } = useTonConnectContext();

  let borrowPositions =
    user?.userReservesData.reduce((acc, userReserve) => {
      if (Number(userReserve.variableBorrows) !== 0) {
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
      if (Number(userReserve.stableBorrows) !== 0) {
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
        .div(isConnectedTonWallet ? Number(user?.collateralInUSDAsset) : maxBorrowAmount)
        .toFixed();

  const checkMaxVariableBorrow: boolean = Number(collateralUsagePercent) * 100 >= 100;

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
      <ListHeaderWrapper sx={{ bgcolor: theme.palette.background.primary }}>
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
              source="Borrowed Positions Dashboard"
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
      wrapperSx={{
        pl: 5,
      }}
      paperSx={(theme) => ({ backgroundColor: theme.palette.background.group })}
      icon={<MoneyIcon sx={{ height: '60px', width: '60px', mb: 3 }} />}
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h2" sx={{ mr: 4, color: 'white' }}>
          <Trans>Your borrows</Trans>
        </Typography>
      }
      localStorageName="borrowedAssetsDashboardTableCollapse"
      isPosition
      subTitleComponent={
        showEModeButton ? (
          <DashboardEModeButton userEmodeCategoryId={user ? user.userEmodeCategoryId : 0} />
        ) : undefined
      }
      noData={!sortedReserves.length}
      subChildrenComponent={
        !sortedReserves.length ? (
          <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
        ) : null
      }
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem title={<Trans>Balance</Trans>} value={user?.totalBorrowsUSD || 0} />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={user?.debtAPY || 0}
                percent
                tooltip={
                  <TotalBorrowAPYTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Total Borrowed APY' },
                    }}
                  />
                }
              />
              <ListTopInfoItem
                title={<Trans>Borrow power used</Trans>}
                value={collateralUsagePercent || 0}
                percent
                tooltip={
                  <BorrowPowerTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Borrow power used' },
                    }}
                  />
                }
              />
            </>
          )}
        </>
      }
    >
      {sortedReserves.length ? (
        <div
          style={{
            backgroundColor: theme.palette.background.primary,
            margin: '0px -20px -20px -20px',
            borderRadius: '12px',
          }}
        >
          {!downToXSM && <RenderHeader />}
          {sortedReserves.map((item) => (
            <div key={item.underlyingAsset + item.borrowRateMode} style={{ padding: '0 20px' }}>
              <BorrowedPositionsListItemWrapper
                item={item}
                checkMaxVariableBorrow={checkMaxVariableBorrow}
              />
            </div>
          ))}
        </div>
      ) : null}
    </ListWrapper>
  );
};
