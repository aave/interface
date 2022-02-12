import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useModalContext } from 'src/hooks/useModal';

import { APYTypeInfoContent } from '../../../../components/infoModalContents/APYTypeInfoContent';
import { BorrowPowerInfoContent } from '../../../../components/infoModalContents/BorrowPowerInfoContent';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardEModeButton } from '../../DashboardEModeButton';
import { ListHeader } from '../ListHeader';
import { ListTopInfoItem } from '../ListTopInfoItem';
import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';

export const BorrowedPositionsList = () => {
  const { user } = useAppDataContext();
  const { openEmode } = useModalContext();

  const borrowPositions =
    user?.userReservesData.reduce((acc, userReserve) => {
      if (userReserve.variableBorrows !== '0') {
        acc.push({ ...userReserve, borrowRateMode: InterestRate.Variable });
      }
      if (userReserve.stableBorrows !== '0') {
        acc.push({ ...userReserve, borrowRateMode: InterestRate.Stable });
      }
      return acc;
    }, [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[]) || [];
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
      subTitleComponent={<DashboardEModeButton onClick={() => openEmode()} />}
      noData={!borrowPositions.length}
      topInfo={
        <>
          {!!borrowPositions.length && (
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
      {borrowPositions.length ? (
        <>
          <ListHeader head={head} />
          {borrowPositions.map((item) => (
            <BorrowedPositionsListItem {...item} key={item.underlyingAsset + item.borrowRateMode} />
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
      )}
    </ListWrapper>
  );
};
