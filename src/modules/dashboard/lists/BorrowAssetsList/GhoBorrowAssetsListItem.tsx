import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { ListColumn } from 'src/components/lists/ListColumn';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getAvailableBorrows, weightedAverageAPY } from 'src/utils/ghoUtilities';

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
  vIncentivesData,
  underlyingAsset,
  isFreezed,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { user } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const { ghoReserveData, ghoUserData, ghoLoadingData } = useAppDataContext();

  // Available borrows is min of user available borrows and remaining facilitator capacity
  const maxAmountUserCanMint = getMaxGhoMintAmount(user).toNumber();
  const availableBorrows = getAvailableBorrows(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorBucketMaxCapacity,
    ghoReserveData.aaveFacilitatorBucketLevel
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;
  const debtBalanceAfterMaxBorrow = availableBorrows + ghoUserData.userGhoBorrowBalance;
  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    debtBalanceAfterMaxBorrow,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

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
            value={ghoLoadingData ? -1 : borrowRateAfterDiscount}
            incentives={vIncentivesData}
            symbol={symbol}
            tooltip={<PercentIcon />}
            borrowAmount={debtBalanceAfterMaxBorrow}
            baseApy={ghoReserveData.ghoVariableBorrowAPY}
            discountPercent={ghoReserveData.ghoDiscountRate * -1}
            discountableAmount={ghoUserData.userGhoAvailableToBorrowAtDiscount}
            stkAaveBalance={ghoUserData.userDiscountTokenBalance}
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
