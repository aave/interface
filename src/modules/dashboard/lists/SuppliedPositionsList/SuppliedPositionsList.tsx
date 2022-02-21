import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListHeader } from '../ListHeader';
import { ListLoader } from '../ListLoader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const suppliedPosition =
    user?.userReservesData.filter((userReserve) => userReserve.underlyingBalance !== '0') || [];

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
              <ListTopInfoItem title={<Trans>APY</Trans>} value={user?.earnedAPY || 0} percent />
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
