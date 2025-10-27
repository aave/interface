import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useMemo } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateHFAfterRepay } from 'src/utils/hfUtils';

import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../../FlowCommons/TxModalDetails';
import { ProtocolSwapParams, ProtocolSwapState, SwapProvider } from '../types';
import { CowCostsDetails } from './CowCostsDetails';

export const RepayWithCollateralDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();

  const currentDebt = state.sourceReserve.variableBorrows;

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
  const debtAmountAfterRepay = useMemo(() => {
    if (!state.minimumReceived || !currentDebt) return valueToBigNumber('0');

    return valueToBigNumber(currentDebt).minus(
      valueToBigNumber(state.minimumReceived) < valueToBigNumber(currentDebt)
        ? valueToBigNumber(state.minimumReceived)
        : valueToBigNumber(currentDebt)
    );
  }, [currentDebt, state.minimumReceived]);

  if (!user || !state.minimumReceived) {
    return null;
  }

  const { hfAfterSwap } = calculateHFAfterRepay({
    amountToReceiveAfterSwap: state.minimumReceived,
    amountToSwap: state.inputAmount,
    fromAssetData: state.destinationReserve.reserve, // used as collateral
    user,
    toAssetData: state.sourceReserve.reserve,
    repayWithUserReserve: state.sourceReserve,
    debt: currentDebt,
  });

  const displayAmountAfterRepayInUsd = debtAmountAfterRepay.multipliedBy(
    state.sourceReserve.reserve.priceInUSD
  );
  const collateralAmountAfterRepay = tokenToRepayWithBalance
    ? valueToBigNumber(tokenToRepayWithBalance).minus(inputAmount)
    : valueToBigNumber('0');
  const collateralAmountAfterRepayUSD = collateralAmountAfterRepay.multipliedBy(
    state.destinationReserve.reserve.priceInUSD
  );

  return (
    <TxModalDetails gasLimit={state.gasLimit} showGasStation={state.showGasStation}>
      {state.provider === SwapProvider.COW_PROTOCOL && <CowCostsDetails state={state} />}

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
