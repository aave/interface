import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getAvailableBorrows, weightedAverageAPY } from 'src/utils/ghoUtilities';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';
import { GhoBorrowAssetsItem } from './types';

export const GhoBorrowAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { user, ghoReserveData, ghoUserData, ghoLoadingData } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();

  // Available borrows is min of user available borrows and remaining facilitator capacity
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user));
  const availableBorrows = getAvailableBorrows(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorBucketMaxCapacity,
    ghoReserveData.aaveFacilitatorBucketLevel
  );
  const debtBalanceAfterMaxBorrow = availableBorrows + ghoUserData.userGhoBorrowBalance;
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;

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
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<Trans>Available to borrow</Trans>}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
      />

      <Row
        caption={
          <VariableAPYTooltip
            text={<Trans>APY, variable</Trans>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <GhoIncentivesCard
          useApyRange
          rangeValues={
            ghoLoadingData ? undefined : [userCurrentBorrowApy, userBorrowApyAfterNewBorrow]
          }
          value={ghoLoadingData ? -1 : userBorrowApyAfterNewBorrow}
          incentives={vIncentivesData}
          symbol={symbol}
          data-cy="apyType"
          borrowAmount={debtBalanceAfterMaxBorrow}
          baseApy={ghoReserveData.ghoVariableBorrowAPY}
          discountPercent={ghoReserveData.ghoDiscountRate * -1}
          discountableAmount={ghoUserData.userGhoAvailableToBorrowAtDiscount}
          stkAaveBalance={ghoUserData.userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
        />
      </Row>

      <Row
        caption={
          <StableAPYTooltip
            text={<Trans>APY, stable</Trans>}
            key="APY_dash_mob_stable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard value={-1} incentives={[]} symbol={symbol} variant="secondary14" />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
