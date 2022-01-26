import { Trans } from '@lingui/macro';

import { DashboardListWrapper } from '../../DashboardListWrapper';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { BorrowedPositionsItem } from './types';

interface BorrowedPositionsListProps {
  listData: BorrowedPositionsItem[];
}

export const BorrowedPositionsList = ({ listData }: BorrowedPositionsListProps) => {
  return (
    <DashboardListWrapper
      title={<Trans>Your borrows</Trans>}
      localStorageName="borrowedAssetsDashboardTableCollapse"
    >
      {listData.map((item, index) => (
        <BorrowedPositionsListItem {...item} key={index} />
      ))}
    </DashboardListWrapper>
  );
};
