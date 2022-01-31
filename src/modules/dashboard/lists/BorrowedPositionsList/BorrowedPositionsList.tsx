import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';

import { APYTypeInfoContent } from '../../../../components/infoModalContents/APYTypeInfoContent';
import { BorrowPowerInfoContent } from '../../../../components/infoModalContents/BorrowPowerInfoContent';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { AppDataContextType } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardEModeButton } from '../../DashboardEModeButton';
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
    <APYTypeInfoContent text={<Trans>APY type</Trans>} key="APY type" variant="subheader2" />,
  ];

  return (
    <ListWrapper
      title={<Trans>Your borrows</Trans>}
      localStorageName="borrowedAssetsDashboardTableCollapse"
      subTitleComponent={
        <DashboardEModeButton
          onClick={() => console.log('TODO: should be e-mode category select modal')}
        />
      }
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
                modalContent={<BorrowPowerInfoContent />}
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
    </ListWrapper>
  );
};
