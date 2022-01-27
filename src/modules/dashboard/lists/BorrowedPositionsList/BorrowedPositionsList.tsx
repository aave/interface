import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';

import { RewardInfoContent } from '../../../../components/infoModalContents/RewardInfoContent';
import { AppDataContextType } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { ListHeader } from '../ListHeader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { BorrowedPositionsItem } from './types';

interface BorrowedPositionsListProps extends Pick<AppDataContextType, 'user'> {
  listData: BorrowedPositionsItem[];
}

export const BorrowedPositionsList = ({ listData, user }: BorrowedPositionsListProps) => {
  const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
    user?.availableBorrowsMarketReferenceCurrency || '0'
  );
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '0'
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
        .div(maxBorrowAmount)
        .toFixed();

  const head = [
    <Trans key="Debt">Debt</Trans>,
    <Trans key="APY">APY</Trans>,
    <RewardInfoContent text={<Trans>Reward</Trans>} key="Reward" variant="subheader2" />,
  ];

  return (
    <DashboardListWrapper
      title={<Trans>Your borrows</Trans>}
      localStorageName="borrowedAssetsDashboardTableCollapse"
      // TODO: need to add e-mode flow
      subTitleComponent={<>E-mode</>}
      noData={!listData.length}
      topInfo={
        <>
          {!!listData.length && (
            <>
              <ListTopInfoItem title={<Trans>Balance</Trans>} value={user?.totalBorrowsUSD || 0} />
              <ListTopInfoItem title={<Trans>APY</Trans>} value={user?.debtAPY || 0} percent />
              <ListTopInfoItem
                title={<Trans>Borrow power used</Trans>}
                value={collateralUsagePercent || 0}
                percent
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
            <BorrowedPositionsListItem {...item} key={index} />
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
      )}
    </DashboardListWrapper>
  );
};
