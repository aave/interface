import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListLoader } from '../ListLoader';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const suppliedPosition =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== '0')
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
      })) || [];

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
          text={<Trans>Collateral</Trans>}
          key="Collateral"
          variant="subheader2"
        />
      ),
      sortKey: 'usageAsCollateralEnabledOnUser',
    },
  ];

  if (sortDesc) {
    if (sortName === 'symbol') {
      suppliedPosition.sort((a, b) =>
        a.reserve.symbol.toUpperCase() < b.reserve.symbol.toUpperCase() ? -1 : 1
      );
    } else if (sortName === 'usageAsCollateralEnabledOnUser') {
      suppliedPosition.sort(
        (a, b) =>
          Number(a.usageAsCollateralEnabledOnUser) - Number(b.usageAsCollateralEnabledOnUser)
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      suppliedPosition.sort((a, b) => a[sortName] - b[sortName]);
    }
  } else {
    if (sortName === 'symbol') {
      suppliedPosition.sort((a, b) =>
        b.reserve.symbol.toUpperCase() < a.reserve.symbol.toUpperCase() ? -1 : 1
      );
    } else if (sortName === 'usageAsCollateralEnabledOnUser') {
      suppliedPosition.sort(
        (a, b) =>
          Number(b.usageAsCollateralEnabledOnUser) - Number(a.usageAsCollateralEnabledOnUser)
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      suppliedPosition.sort((a, b) => b[sortName] - a[sortName]);
    }
  }

  const renderHeader = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? 160 : undefined}
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
        <ListColumn maxWidth={170} minWidth={170} />
      </ListHeaderWrapper>
    );
  };

  if (loading)
    return <ListLoader title={<Trans>Your supplies</Trans>} head={head.map((col) => col.title)} />;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your supplies</Trans>
        </Typography>
      }
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!suppliedPosition.length}
      topInfo={
        <>
          {!!suppliedPosition.length && (
            <>
              <ListTopInfoItem
                title={<Trans>Balance</Trans>}
                value={user?.totalLiquidityUSD || 0}
              />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={user?.earnedAPY || 0}
                percent
                tooltip={<TotalSupplyAPYTooltip />}
              />
              <ListTopInfoItem
                title={<Trans>Collateral</Trans>}
                value={user?.totalCollateralUSD || 0}
                tooltip={<CollateralTooltip />}
              />
            </>
          )}
        </>
      }
    >
      {suppliedPosition.length ? (
        <>
          {!downToXSM && renderHeader()}
          {suppliedPosition.map((item) => (
            <Fragment key={item.underlyingAsset}>
              <AssetCapsProvider asset={item.reserve}>
                {downToXSM ? (
                  <SuppliedPositionsListMobileItem {...item} user={user} />
                ) : (
                  <SuppliedPositionsListItem {...item} user={user} />
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
