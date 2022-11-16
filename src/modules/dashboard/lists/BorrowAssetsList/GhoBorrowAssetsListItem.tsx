import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
// import { GhoDiscountButton } from 'src/components/GhoDiscountButton';
import { GhoBorrowRateTooltip } from 'src/components/infoTooltips/GhoBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import {
  getAvailableBorrows,
  normalizeBaseVariableBorrowRate,
  weightedAverageAPY,
} from 'src/utils/ghoUtilities';

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
    ghoFacilitatorBucketLevel,
    ghoFacilitatorBucketCapacity,
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPRWithMaxDiscount, discountableAmount },
  } = useRootStore();

  // Available borrows is min of user available borrows and remaining facilitator capacity
  const availableBorrows = getAvailableBorrows(
    Number(userAvailableBorrows),
    Number(ghoFacilitatorBucketCapacity),
    Number(ghoFacilitatorBucketLevel)
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;

  const normalizedBaseVariableBorrowRate = normalizeBaseVariableBorrowRate(baseVariableBorrowRate);
  const borrowRateAfterDiscount = weightedAverageAPY(
    normalizedBaseVariableBorrowRate,
    availableBorrows,
    discountableAmount,
    borrowAPRWithMaxDiscount
  );

  const loading = ghoLoadingData || ghoLoadingMarketData;

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
        value={loading ? -1 : borrowRateAfterDiscount}
        incentives={vIncentivesData}
        symbol={symbol}
        tooltip={loading ? null : <GhoBorrowRateTooltip />}
      />
      <ListAPRColumn value={-1} incentives={[]} symbol={symbol} />

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
