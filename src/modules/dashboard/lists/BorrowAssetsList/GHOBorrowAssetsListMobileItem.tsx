import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import {
  getAvailableBorrows,
  ghoDiscountableAmount,
  normalizeBaseVariableBorrowRate,
} from 'src/utils/ghoUtilities';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';
import { GHOBorrowAssetsItem } from './types';

export const GHOBorrowAssetsListMobileItem = ({
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

  const discountableAmount = ghoDiscountableAmount(stkAaveBalance, ghoDiscountedPerToken);

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
        <IncentivesCard
          value={borrowRateAfterDiscount}
          incentives={vIncentivesData}
          symbol={symbol}
          variant="secondary14"
          tooltip={<GHOBorrowRateTooltip />}
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
        <IncentivesCard value={0} incentives={[]} symbol={symbol} variant="secondary14" />
      </Row>

      <GHODiscountButton baseRate={baseVariableBorrowRate} />

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
