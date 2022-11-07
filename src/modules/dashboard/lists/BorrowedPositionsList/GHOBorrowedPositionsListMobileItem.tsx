import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { ghoDiscountableAmount, normalizeBaseVariableBorrowRate } from 'src/utils/ghoUtilities';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { APYTypeTooltip } from '../../../../components/infoTooltips/APYTypeTooltip';
import { Row } from '../../../../components/primitives/Row';
import { ComputedUserReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from '../../../../hooks/useModal';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const GHOBorrowedPositionsListMobileItem = ({
  reserve,
  totalBorrows,
  totalBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
  variableBorrows,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { currentMarket } = useProtocolDataContext();
  const { openBorrow, openRepay, openRateSwitch } = useModalContext();
  const {
    symbol,
    iconSymbol,
    name,
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    underlyingAsset,
    baseVariableBorrowRate,
  } = reserve;
  const [stakeUserResult, ghoDiscountedPerToken, ghoDiscountRatePercent] = useRootStore((state) => [
    state.stakeUserResult,
    state.ghoDiscountedPerToken,
    state.ghoDiscountRatePercent,
  ]);

  const stkAaveBalance = stakeUserResult ? stakeUserResult.aave.stakeTokenUserBalance : '0';

  const discountableAmount = ghoDiscountableAmount(stkAaveBalance, ghoDiscountedPerToken);

  const normalizedBaseVariableBorrowRate = normalizeBaseVariableBorrowRate(baseVariableBorrowRate);
  let borrowRateAfterDiscount =
    normalizedBaseVariableBorrowRate - normalizedBaseVariableBorrowRate * ghoDiscountRatePercent;
  if (discountableAmount < Number(variableBorrows)) {
    // Calculate weighted discount rate aftr max borrow
    borrowRateAfterDiscount =
      (normalizedBaseVariableBorrowRate * (Number(variableBorrows) - discountableAmount) +
        borrowRateAfterDiscount * discountableAmount) /
      Number(variableBorrows);
  }

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={Number(totalBorrows)}
        subValue={Number(totalBorrowsUSD)}
        disabled={Number(totalBorrows) === 0}
      />

      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <IncentivesCard
          value={Number(
            borrowRateMode === InterestRate.Variable ? borrowRateAfterDiscount : stableBorrowAPY
          )}
          incentives={borrowRateMode === InterestRate.Variable ? vIncentivesData : sIncentivesData}
          symbol={symbol}
          variant="secondary14"
          tooltip={<GHOBorrowRateTooltip />}
        />
      </Row>

      <Row
        caption={
          <APYTypeTooltip text={<Trans>APY type</Trans>} key="APY type" variant="description" />
        }
        captionVariant="description"
        mb={2}
      >
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={() => openRateSwitch(underlyingAsset, borrowRateMode)}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={underlyingAsset}
          currentMarket={currentMarket}
        />

        <GHODiscountButton baseRate={baseVariableBorrowRate} />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openRepay(underlyingAsset, borrowRateMode)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
        <Button
          disabled={!isActive || !borrowingEnabled || isFrozen}
          variant="outlined"
          onClick={() => openBorrow(underlyingAsset)}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
