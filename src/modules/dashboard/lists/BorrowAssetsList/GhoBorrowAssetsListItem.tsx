import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
// import { GhoDiscountButton } from 'src/components/GhoDiscountButton';
import { GhoBorrowRateTooltip } from 'src/components/infoTooltips/GhoBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { getAvailableBorrows, normalizeBaseVariableBorrowRate } from 'src/utils/ghoUtilities';

import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { GhoBorrowAssetsItem } from './types';

export const GhoBorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  baseVariableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
  userAvailableBorrows,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const {
    ghoDiscountRatePercent,
    ghoFacilitatorBucketLevel,
    ghoFacilitatorBucketCapacity,
    ghoComputed: { discountableAmount, borrowAPRWithMaxDiscount },
  } = useRootStore();

  // Available borrows is min of user avaiable borrows and remaining facilitator capacity
  const availableBorrows = getAvailableBorrows(
    Number(userAvailableBorrows),
    Number(ghoFacilitatorBucketCapacity),
    Number(ghoFacilitatorBucketLevel)
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;

  const normalizedBaseVariableBorrowRate = normalizeBaseVariableBorrowRate(baseVariableBorrowRate);
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
      // footerButton={
      //   <GhoDiscountButton rate={borrowAPRWithMaxDiscount} amount={discountableAmount} />
      // }
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
        tooltip={<GhoBorrowRateTooltip />}
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
