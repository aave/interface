import { Trans } from '@lingui/macro';

import { RewardInfoContent } from '../../../../components/infoModalContents/RewardInfoContent';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { ListHeader } from '../ListHeader';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { BorrowedPositionsItem } from './types';

interface BorrowedPositionsListProps {
  listData: BorrowedPositionsItem[];
}

export const BorrowedPositionsList = ({ listData }: BorrowedPositionsListProps) => {
  const head = [
    <Trans key="Debt">Debt</Trans>,
    <Trans key="APY">APY</Trans>,
    <RewardInfoContent text={<Trans>Reward</Trans>} key="Reward" variant="subheader2" />,
  ];

  return (
    <DashboardListWrapper
      title={<Trans>Your borrows</Trans>}
      localStorageName="borrowedAssetsDashboardTableCollapse"
    >
      <ListHeader head={head} />
      {listData.map((item, index) => (
        <BorrowedPositionsListItem {...item} key={index} />
      ))}
    </DashboardListWrapper>
  );
};
