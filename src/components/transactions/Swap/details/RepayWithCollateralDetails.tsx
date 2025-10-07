import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateHFAfterRepay } from 'src/utils/hfUtils';

import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../../FlowCommons/TxModalDetails';
import { ProtocolSwapParams, ProtocolSwapState } from '../types';

export const RepayWithCollateralDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();

  if (!user) {
    return null;
  }
  const currentDebt = state.sourceReserve.variableBorrows;

  const { hfAfterSwap } = calculateHFAfterRepay({
    amountToReceiveAfterSwap: state.outputAmount, // TODO: should use minimum received
    amountToSwap: state.inputAmount,
    fromAssetData: state.destinationReserve.reserve, // used as collateral
    user,
    toAssetData: state.sourceReserve.reserve,
    repayWithUserReserve: state.sourceReserve,
    debt: currentDebt,
  });

  //   // If the selected collateral asset is frozen, a flashloan must be used. When a flashloan isn't used,
  //   // the remaining amount after the swap is deposited into the pool, which will fail for frozen assets.
  //   const shouldUseFlashloan =
  //     useFlashloan(user.healthFactor, hfEffectOfFromAmount.toString()) ||
  //     state.destinationReserve.reserve.isFrozen;

  const inputAmount = state.inputAmount;

  // we need to get the min as minimumReceived can be greater than debt as we are swapping
  // a safe amount to repay all. When this happens amountAfterRepay would be < 0 and
  // this would show as certain amount left to repay when we are actually repaying all debt
  const tokenToRepayWithBalance = state.destinationReserve.underlyingBalance;
  const debtAmountAfterRepay = valueToBigNumber(currentDebt).minus(
    state.outputAmount < currentDebt ? state.outputAmount : currentDebt
  );
  const displayAmountAfterRepayInUsd = debtAmountAfterRepay.multipliedBy(
    state.sourceReserve.reserve.priceInUSD
  );
  const collateralAmountAfterRepay = tokenToRepayWithBalance
    ? valueToBigNumber(tokenToRepayWithBalance).minus(inputAmount)
    : valueToBigNumber('0');
  const collateralAmountAfterRepayUSD = collateralAmountAfterRepay.multipliedBy(
    state.destinationReserve.reserve.priceInUSD
  );

  //   const exactOutputAmount = repayAmount; // swapVariant === 'exactIn' ? outputAmount : repayAmount;
  //   const exactOutputUsd = repayAmountUsdValue; // swapVariant === 'exactIn' ? outputAmountUSD : repayAmountUsdValue;

  // TODO: move to error component
  //       const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();

  //   let blockingError: ErrorType | undefined = undefined;

  //   if (
  //     assetsBlockingWithdraw.length > 0 &&
  //     !assetsBlockingWithdraw.includes(tokenToRepayWith.symbol)
  //   ) {
  //     blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
  //   } else if (valueToBigNumber(tokenToRepayWithBalance).lt(inputAmount)) {
  //     blockingError = ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH;
  //   } else if (shouldUseFlashloan && !collateralReserveData.flashLoanEnabled) {
  //     blockingError = ErrorType.FLASH_LOAN_NOT_AVAILABLE;
  //   }

  return (
    <TxModalDetails gasLimit={state.gasLimit}>
      <DetailsHFLine
        visibleHfChange={!!state.inputAmount}
        healthFactor={user?.healthFactor}
        futureHealthFactor={hfAfterSwap.toString(10)}
      />
      <DetailsNumberLineWithSub
        description={<Trans>Borrow balance after repay</Trans>}
        futureValue={debtAmountAfterRepay.toString()}
        futureValueUSD={displayAmountAfterRepayInUsd.toString()}
        symbol={state.sourceReserve.reserve.symbol}
        tokenIcon={state.sourceReserve.reserve.iconSymbol}
        loading={state.ratesLoading}
        hideSymbolSuffix
      />
      <DetailsNumberLineWithSub
        description={<Trans>Collateral balance after repay</Trans>}
        futureValue={collateralAmountAfterRepay.toString()}
        futureValueUSD={collateralAmountAfterRepayUSD.toString()}
        symbol={state.destinationReserve.reserve.symbol}
        tokenIcon={state.destinationReserve.reserve.iconSymbol}
        loading={state.ratesLoading}
        hideSymbolSuffix
      />
    </TxModalDetails>
  );
};
