import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useMemo, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DASHBOARD, GENERAL } from 'src/utils/events';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { amountToUsd } from '../../../../utils/utils';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListTopPanel } from '../../DashboardListTopPanel';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <Trans key="Balance">Balance</Trans>,
    sortKey: 'underlyingBalance',
  },

  {
    title: <Trans key="APY">APY</Trans>,
    sortKey: 'supplyAPY',
  },
  {
    title: (
      <CollateralSwitchTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'Collateral Switch' },
        }}
        text={<Trans>Collateral</Trans>}
        key="Collateral"
        variant="subheader2"
      />
    ),
    sortKey: 'usageAsCollateralEnabledOnUser',
  },
];

export const SMALL_BALANCE_THRESHOLD = 0.001;

export const SuppliedPositionsList = () => {
  const { user, loading, marketReferencePriceInUsd } = useAppDataContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const localStorageName = 'showSuppliedSmallBalanceAssets';
  const [isShowSmallBalanceAssets, setIsShowSmallBalanceAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );

  const userHasSmallBalanceAssets = useMemo(() => {
    return user?.userReservesData.some((userReserve) => {
      if (userReserve.underlyingBalance === '0') return false;

      const balanceUSD = amountToUsd(
        userReserve.underlyingBalance,
        userReserve.reserve.formattedPriceInMarketReferenceCurrency,
        marketReferencePriceInUsd
      );

      return Number(balanceUSD) <= SMALL_BALANCE_THRESHOLD;
    });
  }, [user?.userReservesData, marketReferencePriceInUsd]);

  const suppliedPositions = useMemo(() => {
    return (
      user?.userReservesData
        .filter((userReserve) => {
          if (userReserve.underlyingBalance === '0') return false;

          if (!!isShowSmallBalanceAssets) return true;

          // Filter out dust amounts < $0.01 USD
          const balanceUSD = amountToUsd(
            userReserve.underlyingBalance,
            userReserve.reserve.formattedPriceInMarketReferenceCurrency,
            marketReferencePriceInUsd
          );
          return Number(balanceUSD) >= SMALL_BALANCE_THRESHOLD;
        })
        .map((userReserve) => ({
          ...userReserve,
          supplyAPY: userReserve.reserve.supplyAPY, // Note: added only for table sort
          reserve: {
            ...userReserve.reserve,
            ...(userReserve.reserve.isWrappedBaseAsset
              ? fetchIconSymbolAndName({
                  symbol: currentNetworkConfig.baseAssetSymbol,
                  underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                })
              : {}),
          },
        })) || []
    );
  }, [isShowSmallBalanceAssets, user?.userReservesData, marketReferencePriceInUsd]);

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = suppliedPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'position',
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
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source="Supplied Positions Dashboard"
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
    return <ListLoader title={<Trans>Your supplies</Trans>} head={head.map((col) => col.title)} />;

  return (
    <ListWrapper
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your supplies</Trans>
        </Typography>
      }
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!sortedReserves.length}
      subChildrenComponent={
        !!userHasSmallBalanceAssets && (
          <Box>
            <DashboardListTopPanel
              value={isShowSmallBalanceAssets}
              onClick={setIsShowSmallBalanceAssets}
              localStorageName={localStorageName}
              bridge={currentNetworkConfig.bridge}
              eventName={DASHBOARD.SHOW_ASSETS_SMALL_BALANCE}
              label={<Trans>Show assets with small balance</Trans>}
              showFaucet={false}
              showBridge={false}
            />
          </Box>
        )
      }
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem
                title={<Trans>Balance</Trans>}
                value={user?.totalLiquidityUSD || 0}
              />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={user?.earnedAPY || 0}
                percent
                tooltip={
                  <TotalSupplyAPYTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Total Supplied APY' },
                    }}
                  />
                }
              />
              <ListTopInfoItem
                title={<Trans>Collateral</Trans>}
                value={user?.totalCollateralUSD || 0}
                tooltip={
                  <CollateralTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Total Supplied Collateral' },
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
        <>
          {!downToXSM && <RenderHeader />}
          {sortedReserves.map((item) => (
            <Fragment key={item.underlyingAsset}>
              <AssetCapsProvider asset={item.reserve}>
                {downToXSM ? (
                  <SuppliedPositionsListMobileItem {...item} />
                ) : (
                  <SuppliedPositionsListItem {...item} />
                )}
              </AssetCapsProvider>
            </Fragment>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </ListWrapper>
  );
};
