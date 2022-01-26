import { Trans } from '@lingui/macro';

import { CollateralInfoContent } from '../../../../components/infoModalContents/CollateralInfoContent';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { ListHeader } from '../ListHeader';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsItem } from './types';

interface SuppliedPositionsListProps {
  listData: SuppliedPositionsItem[];
}

export const SuppliedPositionsList = ({ listData }: SuppliedPositionsListProps) => {
  const head = [
    <Trans key="Balance">Balance</Trans>,
    <Trans key="APY">APY</Trans>,
    <CollateralInfoContent
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
