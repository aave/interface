import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { ListColumn } from 'src/components/lists/ListColumn';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
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
  userVariableBorrows,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { user } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const {
    ghoFacilitatorBucketLevel,
    ghoFacilitatorBucketCapacity,
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPYWithMaxDiscount, discountableAmount },
    stkAaveBalance,
    ghoDiscountRatePercent,
    ghoBorrowAPY,
  } = useRootStore();

  // Available borrows is min of user available borrows and remaining facilitator capacity
  const maxAmountUserCanMint = getMaxGhoMintAmount(user).toNumber();
  const availableBorrows = getAvailableBorrows(
    maxAmountUserCanMint,
    Number(ghoFacilitatorBucketCapacity),
    Number(ghoFacilitatorBucketLevel)
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;
  const debtBalanceAfterMaxBorrow = availableBorrows + Number(userVariableBorrows);
  const normalizedBaseVariableBorrowRate = normalizeBaseVariableBorrowRate(baseVariableBorrowRate);
  const borrowRateAfterDiscount = weightedAverageAPY(
    normalizedBaseVariableBorrowRate,
    debtBalanceAfterMaxBorrow,
    discountableAmount,
    borrowAPYWithMaxDiscount
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
      ghoBorder
    >
      <ListValueColumn
        symbol={symbol}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
        withTooltip
      />
      <ListColumn>
        <Box sx={{ display: 'flex' }}>
          <GhoIncentivesCard
            value={loading ? -1 : borrowRateAfterDiscount}
            incentives={vIncentivesData}
            symbol={symbol}
            data-cy={`apyType`}
            tooltip={<PercentIcon />}
            borrowAmount={debtBalanceAfterMaxBorrow}
            baseApy={ghoBorrowAPY}
            discountPercent={ghoDiscountRatePercent * -1}
            discountableAmount={discountableAmount}
            stkAaveBalance={stkAaveBalance || 0}
            ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
          />
        </Box>
      </ListColumn>

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
