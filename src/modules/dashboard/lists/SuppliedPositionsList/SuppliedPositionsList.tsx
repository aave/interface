import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import type { MarketUserReserveSupplyPosition } from '@aave/graphql';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useMemo, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
import { useEnhancedUserYield } from 'src/hooks/useEnhancedUserYield';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DASHBOARD, GENERAL } from 'src/utils/events';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import {
  ReserveWithId,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListTopPanel } from '../../DashboardListTopPanel';
import { isAssetHidden } from '../constants';
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
  const { loading, supplyReserves, userState, userSupplies } = useAppDataContext();
  const userSupplyPositions = userSupplies ?? [];
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { earnedAPY } = useEnhancedUserYield();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const localStorageName = 'showSuppliedSmallBalanceAssets';
  const [isShowSmallBalanceAssets, setIsShowSmallBalanceAssets] = useState(
    localStorage.getItem(localStorageName) === 'true'
  );

  const supplyReservesLookup = useMemo(() => {
    const map = new Map<string, ReserveWithId>();
    supplyReserves.forEach((reserve) => {
      const address = reserve.underlyingToken.address?.toLowerCase();
      if (address) {
        map.set(address, reserve);
      }
    });
    return map;
  }, [supplyReserves]);

  const userHasSmallBalanceAssets = useMemo(() => {
    return userSupplyPositions.some((position) => {
      const balanceValue = Number(position.balance.amount.value ?? '0');
      if (balanceValue <= 0) {
        return false;
      }
      const balanceUSD = Number(position.balance.usd ?? '0');
      return balanceUSD > 0 && balanceUSD <= SMALL_BALANCE_THRESHOLD;
    });
  }, [userSupplyPositions]);

  const suppliedPositions = useMemo(() => {
    if (!userSupplyPositions.length) {
      return [];
    }

    return userSupplyPositions
      .map((position: MarketUserReserveSupplyPosition) => {
        const underlyingTokenAddress = position.currency.address.toLowerCase();
        const reserve = supplyReservesLookup.get(underlyingTokenAddress);

        if (!reserve) {
          console.warn(
            '[SuppliedPositionsList] Missing reserve snapshot for supplied position',
            position.currency.symbol,
            position.currency.address
          );
          return null;
        }

        if (isAssetHidden(currentMarketData.market, underlyingTokenAddress)) {
          return null;
        }

        if (position.balance.amount.value === '0') {
          return null;
        }

        const balanceUSD = Number(position.balance.usd ?? '0');
        if (!isShowSmallBalanceAssets && balanceUSD < SMALL_BALANCE_THRESHOLD) {
          return null;
        }
        const isWrappedNative = reserve.acceptsNative !== null;

        const updatedReserve: ReserveWithId = {
          ...reserve,
          supplyAPY: Number(position.apy.value),
          underlyingBalance: position.balance.usd,
          usageAsCollateralEnabledOnUser: position.canBeCollateral,
          isCollateralPosition: position.isCollateral,
          apyPosition: position.apy,
          balancePosition: position.balance,
        };

        if (isWrappedNative) {
          const nativeData = fetchIconSymbolAndName({
            symbol: currentNetworkConfig.baseAssetSymbol,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          });

          return [
            // Native token if isWrappedNative
            {
              ...updatedReserve,
              symbol: nativeData.symbol,
              iconSymbol: nativeData.iconSymbol,
              name: nativeData.name,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              detailsAddress: position.currency.address, // Dirección real para funcionalidad
              id: reserve.id + '_native',
              reserve: updatedReserve,
            },
          ];
        }

        return {
          ...updatedReserve,
          reserve: updatedReserve,
        };
      })
      .flat()
      .filter(Boolean);
  }, [
    currentMarketData.market,
    currentNetworkConfig.baseAssetSymbol,
    isShowSmallBalanceAssets,
    supplyReservesLookup,
    userSupplyPositions,
  ]);

  const totalSupplyUSD = useMemo(() => {
    return suppliedPositions.reduce(
      (sum, position) => sum + Number(position?.balancePosition?.usd || '0'),
      0
    );
  }, [suppliedPositions]);

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
              <ListTopInfoItem title={<Trans>Balance</Trans>} value={totalSupplyUSD || 0} />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={earnedAPY || 0}
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
                value={userState?.totalCollateralBase || 0}
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
              <AssetCapsProviderSDK asset={item.reserve}>
                {downToXSM ? (
                  <SuppliedPositionsListMobileItem {...item} />
                ) : (
                  <SuppliedPositionsListItem {...item} />
                )}
              </AssetCapsProviderSDK>
            </Fragment>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </ListWrapper>
  );
};
