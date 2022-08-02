import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { valueToBigNumber } from '@aave/math-utils';
import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListHeader } from '../ListHeader';
import { ListLoader } from '../ListLoader';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const suppliedPosition =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== '0')
      .map((userReserve) => ({
        ...userReserve,
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
    <Trans key="Balance">Balance</Trans>,
    <Trans key="APY">APY</Trans>,
    <CollateralSwitchTooltip
      text={<Trans>Collateral</Trans>}
      key="Collateral"
      variant="subheader2"
    />,
  ];

  if (loading) return <ListLoader title={<Trans>Your supplies</Trans>} head={head} />;

  return (
    <ListWrapper
      title={<Trans>Your supplies</Trans>}
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
          {!downToXSM && <ListHeader head={head} />}
          {suppliedPosition.map((item) =>
            downToXSM ? (
              <SuppliedPositionsListMobileItem {...item} user={user} key={item.underlyingAsset} />
            ) : (
              <SuppliedPositionsListItem {...item} user={user} key={item.underlyingAsset} />
            )
          )}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </ListWrapper>
  );
};
