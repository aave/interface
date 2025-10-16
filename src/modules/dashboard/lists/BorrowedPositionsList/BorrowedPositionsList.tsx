import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { MarketUserReserveBorrowPosition } from '@aave/graphql/import';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GENERAL } from 'src/utils/events';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { BorrowPowerTooltip } from '../../../../components/infoTooltips/BorrowPowerTooltip';
import { TotalBorrowAPYTooltip } from '../../../../components/infoTooltips/TotalBorrowAPYTooltip';
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
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardEModeButton } from '../../DashboardEModeButton';
import { isAssetHidden } from '../constants';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';

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
];

export const BorrowedPositionsList = () => {
  const { loading, eModeCategories, borrowReserves, userBorrows, userState } = useAppDataContext();
  //! debug
  console.log('eModeCategories', eModeCategories);
  const [currentMarketData, currentNetworkConfig] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.currentNetworkConfig])
  );
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const showEModeButton = currentMarketData.v3 && Object.keys(eModeCategories).length > 1;
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const borrowReservesLookup = useMemo(() => {
    const map = new Map<string, ReserveWithId>();
    borrowReserves.forEach((reserve) => {
      const address = reserve.underlyingToken.address?.toLowerCase();
      if (address) {
        map.set(address, reserve);
      }
    });
    return map;
  }, [borrowReserves]);

  let borrowedPositions = useMemo(() => {
    if (!userBorrows?.length) {
      return [];
    }

    return userBorrows
      .map((position: MarketUserReserveBorrowPosition) => {
        const underlyingTokenAddress = position.currency.address.toLowerCase();
        const reserve = borrowReservesLookup.get(underlyingTokenAddress);

        if (!reserve) {
          console.warn(
            '[BorrowedPositionsList] Missing reserve snapshot for borrowed position',
            position.currency.symbol,
            position.currency.address
          );
          return null;
        }

        if (isAssetHidden(currentMarketData.market, underlyingTokenAddress)) {
          return null;
        }

        if (position.debt.amount.value === '0') {
          return null;
        }

        const isWrappedNative = reserve.acceptsNative !== null;

        const updatedReserve: ReserveWithId = {
          ...reserve,
          borrowAPY: Number(position.apy.value),
          underlyingBalance: position.debt.usd,
          apyPosition: position.apy,
          balancePosition: position.debt,
        };

        if (isWrappedNative) {
          const nativeData = fetchIconSymbolAndName({
            symbol: currentNetworkConfig.baseAssetSymbol, // ETH, MATIC, etc
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          });

          return {
            ...updatedReserve,
            symbol: nativeData.symbol,
            iconSymbol: nativeData.iconSymbol,
            name: nativeData.name,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            detailsAddress: position.currency.address, // Dirección real para funcionalidad
            id: reserve.id + '_native',
            reserve: updatedReserve,
          };
        }

        return {
          ...updatedReserve,
          reserve: updatedReserve,
        };
      })
      .filter(Boolean);
  }, [
    currentMarketData.market,
    currentNetworkConfig.baseAssetSymbol,
    borrowReservesLookup,
    userBorrows,
  ]);
  //! Debug
  console.log('borrowedPositions', borrowedPositions);
  const userdebtAPY = useMemo(() => {
    const totalDebtUSD = borrowedPositions.reduce(
      (sum, position) => sum + Number(position?.balancePosition?.usd || '0'),
      0
    );

    // APY ponderado por balance USD
    const weightedSupplyAPY = borrowedPositions.reduce((sum, position) => {
      const balanceUSD = Number(position?.balancePosition?.usd || '0');
      const apy = Number(position?.apyPosition?.value || '0');
      return sum + balanceUSD * apy;
    }, 0);

    // APY promedio ponderado
    const debtAPY = totalDebtUSD > 0 ? weightedSupplyAPY / totalDebtUSD : 0;

    return { debtAPY, totalDebtUSD };
  }, [borrowedPositions]);
  const disableEModeSwitch = useMemo(() => {
    //! Si E-mode no está habilitado, el botón debe estar habilitado para permitir activarlo
    if (!userState?.eModeEnabled) {
      return 0;
    }

    //! Si E-mode está habilitado, verificar si hay suficientes reservas para prestamos
    const eligibleReserves = borrowReserves.filter((reserve) => {
      //! Buscar la categoría E-mode actual del usuario
      const userEmodeCategory = reserve.userState?.emode?.categoryId;
      if (!userEmodeCategory) return false;

      return reserve.eModeInfo?.find((e) => e.categoryId === userEmodeCategory && e.canBeBorrowed);
    });

    //! Si hay menos de 2 reservas disponibles para préstamos en E-mode, deshabilitar el switch
    return eligibleReserves.length < 2;
  }, [userState?.eModeEnabled, borrowReserves]);
  const userEmodeCategoryId = useMemo(() => {
    // ✅ PRIMERO verificar si E-mode está habilitado en el SDK
    if (!userState?.eModeEnabled) {
      return 0; // E-mode deshabilitado = categoryId 0
    }

    // Solo si está habilitado, buscar la categoría
    const reserveWithEmode = borrowReserves.find((reserve) =>
      reserve.eModeInfo.find(
        (e) => e.categoryId === reserve.userState?.emode?.categoryId && e.canBeBorrowed
      )
    );

    return reserveWithEmode?.userState?.emode?.categoryId || 0;
  }, [userState?.eModeEnabled, borrowReserves]);
  //! no se si userBorrows o otra propiedad
  if (loading || !userBorrows)
    return <ListLoader title={<Trans>Your borrows</Trans>} head={head.map((c) => c.title)} />;

  // Move GHO to top of borrowed positions list
  const ghoReserve = borrowedPositions.filter(
    (pos) => pos?.reserve.underlyingToken.symbol === GHO_SYMBOL
  );
  if (ghoReserve.length > 0) {
    borrowedPositions = borrowedPositions.filter(
      (pos) => pos?.reserve.underlyingToken.symbol !== GHO_SYMBOL
    );
    borrowedPositions.unshift(ghoReserve[0]);
  }

  const maxBorrowAmount = valueToBigNumber(userState?.totalDebtBase || '0').plus(
    userState?.availableBorrowsBase || '0'
  );

  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '0'
    : valueToBigNumber(userState?.totalDebtBase || '0')
        .div(maxBorrowAmount)
        .toFixed();

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = borrowedPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'position',
    preSortedReserves,
    true
  ).filter((reserve) => !isAssetHidden(currentMarketData.market, reserve.underlyingAsset));

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

  return (
    <ListWrapper
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your borrows</Trans>
        </Typography>
      }
      localStorageName="borrowedAssetsDashboardTableCollapse"
      subTitleComponent={
        showEModeButton ? (
          <DashboardEModeButton userEmodeCategoryId={userState ? userEmodeCategoryId! : 0} />
        ) : undefined
      }
      noData={!sortedReserves.length}
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem
                title={<Trans>Balance</Trans>}
                value={userdebtAPY.totalDebtUSD || 0}
              />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={userdebtAPY.debtAPY || 0}
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
        <>
          {!downToXSM && <RenderHeader />}
          {sortedReserves.map((item) => (
            <AssetCapsProviderSDK
              asset={item.reserve}
              key={item.underlyingAsset + item.borrowRateMode}
            >
              <BorrowedPositionsListItem item={item} disableEModeSwitch={disableEModeSwitch} />
            </AssetCapsProviderSDK>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
      )}
    </ListWrapper>
  );
};
