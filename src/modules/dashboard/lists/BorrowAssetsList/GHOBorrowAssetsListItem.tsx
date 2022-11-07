import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { getAvailableBorrows } from 'src/utils/ghoUtilities';

import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { GHOBorrowAssetsItem } from './types';

export const GHOBorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  baseVariableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
  userAvailableBorrows,
}: GHOBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const [
    stakeUserResult,
    ghoDiscountedPerToken,
    ghoDiscountRatePercent,
    ghoFacilitatorBucketLevel,
    ghoFacilitatorBucketCapacity,
  ] = useRootStore((state) => [
    state.stakeUserResult,
    state.ghoDiscountedPerToken,
    state.ghoDiscountRatePercent,
    state.ghoFacilitatorBucketLevel,
    state.ghoFacilitatorBucketCapacity,
  ]);
  // Available borrows is min of user avaiable borrows and remaining facilitator capacity
  const availableBorrows = getAvailableBorrows(
    Number(userAvailableBorrows),
    Number(ghoFacilitatorBucketCapacity),
    Number(ghoFacilitatorBucketLevel)
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;

  const stkAaveBalance = stakeUserResult ? stakeUserResult.aave.stakeTokenUserBalance : '0';

  // Amount of GHO that can be borrowed at a discounted rate given a users stkAave balance
  const discountableAmount =
    Number(formatUnits(stkAaveBalance, 18)) * Number(ghoDiscountedPerToken);

  const normalizedBaseVariableBorrowRate = Number(baseVariableBorrowRate) / 10 ** 27;
  let borrowRateAfterDiscount =
    normalizedBaseVariableBorrowRate - normalizedBaseVariableBorrowRate * ghoDiscountRatePercent;
  if (discountableAmount < availableBorrows) {
    // Calculate weighted discount rate aftr max borrow
    borrowRateAfterDiscount =
      (normalizedBaseVariableBorrowRate * (availableBorrows - discountableAmount) +
        borrowRateAfterDiscount * discountableAmount) /
      availableBorrows;
  }

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      footerButton={<GHODiscountButton baseRate={baseVariableBorrowRate} />}
    >
      <ListValueColumn
        symbol={symbol}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
        withTooltip
      />

      <ListAPRColumn
        value={borrowRateAfterDiscount}
        incentives={vIncentivesData}
        symbol={symbol}
        tooltip={<GHOBorrowRateTooltip />}
      />
      <ListAPRColumn value={0} incentives={[]} symbol={symbol} />

      <ListButtonsColumn>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
