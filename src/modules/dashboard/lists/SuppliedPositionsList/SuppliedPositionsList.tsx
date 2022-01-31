import { Trans } from '@lingui/macro';

import { CollateralInfoContent } from '../../../../components/infoModalContents/CollateralInfoContent';
import { CollateralSwitchInfoContent } from '../../../../components/infoModalContents/CollateralSwitchInfoContent';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListHeader } from '../ListHeader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';

export const SuppliedPositionsList = () => {
  const { user } = useAppDataContext();

  const suppliedPosition =
    user?.userReservesData.filter((userReserve) => userReserve.underlyingBalance !== '0') || [];
  const head = [
    <Trans key="Balance">Balance</Trans>,
    <Trans key="APY">APY</Trans>,
    <CollateralSwitchInfoContent
      text={<Trans>Collateral</Trans>}
      key="Collateral"
      variant="subheader2"
    />,
  ];

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
                modalContent={<CollateralInfoContent />}
              />
            </>
          )}
        </>
      }
    >
      {suppliedPosition.length ? (
        <>
          <ListHeader head={head} />
          {suppliedPosition.map((item) => (
            <SuppliedPositionsListItem {...item} key={item.underlyingAsset} />
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </ListWrapper>
  );
};
