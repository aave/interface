import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { ListColumn } from 'src/components/lists/ListColumn';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
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
  const { ghoReserveData, ghoUserData } = useAppDataContext();
  const { ghoUserDataFetched } = useRootStore();

  // Available borrows is min of user available borrows and remaining facilitator capacity
  const maxAmountUserCanMint = getMaxGhoMintAmount(user).toNumber();
  const availableBorrows = getAvailableBorrows(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorBucketMaxCapacity,
    ghoReserveData.aaveFacilitatorBucketLevel
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;
  const debtBalanceAfterMaxBorrow = availableBorrows + ghoUserData.userGhoBorrowBalance;

  // Determine borrow APY range
  const userCurrentBorrowApy = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );
  const userBorrowApyAfterNewBorrow = weightedAverageAPY(
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
    >
      <ListValueColumn
        symbol={symbol}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
        withTooltip
      />
      <ListColumn>
        <GhoIncentivesCard
          useApyRange
          rangeValues={
            ghoUserDataFetched ? [userCurrentBorrowApy, userBorrowApyAfterNewBorrow] : undefined
          }
          value={ghoUserDataFetched ? userBorrowApyAfterNewBorrow : -1}
          incentives={vIncentivesData}
          symbol={symbol}
          data-cy={`apyType`}
          borrowAmount={debtBalanceAfterMaxBorrow}
          baseApy={ghoReserveData.ghoVariableBorrowAPY}
          discountPercent={ghoReserveData.ghoDiscountRate * -1}
          discountableAmount={ghoUserData.userGhoAvailableToBorrowAtDiscount}
          stkAaveBalance={ghoUserData.userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
        />
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
