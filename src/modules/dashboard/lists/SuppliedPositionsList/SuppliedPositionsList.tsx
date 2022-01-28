import { Trans } from '@lingui/macro';

import { CollateralInfoContent } from '../../../../components/infoModalContents/CollateralInfoContent';
import { CollateralSwitchInfoContent } from '../../../../components/infoModalContents/CollateralSwitchInfoContent';
import { AppDataContextType } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { ListHeader } from '../ListHeader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsItem } from './types';

interface SuppliedPositionsListProps extends Pick<AppDataContextType, 'user'> {
  listData: SuppliedPositionsItem[];
}

export const SuppliedPositionsList = ({ listData, user }: SuppliedPositionsListProps) => {
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
    <DashboardListWrapper
      title={<Trans>Your supplies</Trans>}
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!listData.length}
      topInfo={
        <>
          {!!listData.length && (
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
      {listData.length ? (
        <>
          <ListHeader head={head} />
          {listData.map((item, index) => (
            <SuppliedPositionsListItem {...item} key={index} />
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </DashboardListWrapper>
  );
};
