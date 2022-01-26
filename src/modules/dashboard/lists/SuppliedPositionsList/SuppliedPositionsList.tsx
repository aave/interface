import { Trans } from '@lingui/macro';

import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsItem } from './types';

interface SuppliedPositionsListProps {
  listData: SuppliedPositionsItem[];
}

export const SuppliedPositionsList = ({ listData }: SuppliedPositionsListProps) => {
  return (
    <DashboardListWrapper
      title={<Trans>Your supplies</Trans>}
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!listData.length}
    >
      {listData.length ? (
        listData.map((item) => <SuppliedPositionsListItem {...item} key={item.reserve.id} />)
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </DashboardListWrapper>
  );
};
