import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { APYTypeTooltip } from '../../../../components/infoTooltips/APYTypeTooltip';
import { BorrowPowerTooltip } from '../../../../components/infoTooltips/BorrowPowerTooltip';
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
import { BorrowedPositionsListMobileItem } from './BorrowedPositionsListMobileItem';

export const BorrowedPositionsList = () => {
  const { user } = useAppDataContext();
  const { currentMarketData } = useProtocolDataContext();
  const { openEmode } = useModalContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

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
    <APYTypeTooltip text={<Trans>APY type</Trans>} key="APY type" variant="subheader2" />,
  ];

  return (
    <ListWrapper
      title={<Trans>Your borrows</Trans>}
      localStorageName="borrowedAssetsDashboardTableCollapse"
      subTitleComponent={
        currentMarketData.v3 ? <DashboardEModeButton onClick={() => openEmode()} /> : undefined
      }
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
                tooltip={<BorrowPowerTooltip />}
              />
            </>
          )}
        </>
      }
    >
      {borrowPositions.length ? (
        <>
          {!downToXSM && <ListHeader head={head} />}
          {borrowPositions.map((item) =>
            downToXSM ? (
              <BorrowedPositionsListMobileItem
                {...item}
                key={item.underlyingAsset + item.borrowRateMode}
              />
            ) : (
              <BorrowedPositionsListItem
                {...item}
                key={item.underlyingAsset + item.borrowRateMode}
              />
            )
          )}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
      )}
    </ListWrapper>
  );
};
