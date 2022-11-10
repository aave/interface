import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { GhoDiscountButton } from 'src/components/GhoDiscountButton';
import { GhoBorrowRateTooltip } from 'src/components/infoTooltips/GhoBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { ComputedUserReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const GhoBorrowedPositionsListItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  stableBorrows,
  stableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay, openRateSwitch } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const {
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    baseVariableBorrowRate,
  } = reserve;
  const [stakeUserResult, ghoDiscountedPerToken, ghoDiscountRatePercent] = useRootStore((state) => [
    state.stakeUserResult,
    state.ghoDiscountedPerToken,
    state.ghoDiscountRatePercent,
  ]);

  const stkAaveBalance = stakeUserResult ? stakeUserResult.aave.stakeTokenUserBalance : '0';

  // Amount of GHO that can be borrowed at a discounted rate given a users stkAave balance
  const discountableAmount =
    Number(formatUnits(stkAaveBalance, 18)) * Number(ghoDiscountedPerToken);

  const normalizedBaseVariableBorrowRate = Number(baseVariableBorrowRate) / 10 ** 27;
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
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      data-cy={`dashboardBorrowedListItem_${reserve.symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
      footerButton={<GhoDiscountButton baseRate={baseVariableBorrowRate} />}
    >
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(borrowRateMode === InterestRate.Variable ? variableBorrows : stableBorrows)}
        subValue={Number(
          borrowRateMode === InterestRate.Variable ? variableBorrowsUSD : stableBorrowsUSD
        )}
      />

      <ListAPRColumn
        value={Number(
          borrowRateMode === InterestRate.Variable ? borrowRateAfterDiscount : stableBorrowAPY
        )}
        incentives={borrowRateMode === InterestRate.Variable ? vIncentivesData : sIncentivesData}
        symbol={reserve.symbol}
        tooltip={<GhoBorrowRateTooltip />}
      />

      <ListColumn>
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={() => openRateSwitch(reserve.underlyingAsset, borrowRateMode)}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={reserve.underlyingAsset}
          currentMarket={currentMarket}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openRepay(reserve.underlyingAsset, borrowRateMode)}
        >
          <Trans>Repay</Trans>
        </Button>
        <Button
          disabled={!isActive || !borrowingEnabled || isFrozen}
          variant="outlined"
          onClick={() => openBorrow(reserve.underlyingAsset)}
        >
          <Trans>Borrow</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
