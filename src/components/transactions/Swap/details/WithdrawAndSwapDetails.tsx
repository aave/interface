import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { useShallow } from 'zustand/shallow';

import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { ProtocolSwapParams, ProtocolSwapState } from '../types';
import { SwapModalTxDetails } from './SwapDetails';

export const WithdrawAndSwapDetails = ({
  state,
  params,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();
  const { currentNetworkConfig } = useRootStore(
    useShallow((store) => ({ currentNetworkConfig: store.currentNetworkConfig }))
  );

  const underlyingBalance = valueToBigNumber(state.sourceReserve.underlyingBalance);
  const withdrawAmount = state.inputAmount;
  const poolReserve = state.sourceReserve.reserve;

  if (!user || !state.buyAmountFormatted || !state.buyAmountUSD || !state.sellAmountFormatted)
    return null;
  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve: state.sourceReserve,
    poolReserve,
    withdrawAmount,
  });

  return (
    <TxModalDetails gasLimit={state.gasLimit} showGasStation={state.showGasStation}>
      <SwapModalTxDetails
        state={state}
        provider={state.provider}
        safeSlippage={state.safeSlippage}
        customReceivedTitle={params.customReceivedTitle}
        sellToken={state.sourceToken}
        buyToken={state.destinationToken}
        buyAmount={state.buyAmountFormatted}
        sellAmount={state.sellAmountFormatted}
        buyAmountUSD={state.buyAmountUSD}
      />
      <DetailsNumberLine
        description={<Trans>Remaining supply</Trans>}
        value={underlyingBalance.minus(withdrawAmount || '0').toString(10)}
        symbol={
          poolReserve.isWrappedBaseAsset ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol
        }
      />
      <DetailsHFLine
        visibleHfChange={!!state.inputAmount}
        healthFactor={user ? user.healthFactor : '-1'}
        futureHealthFactor={healthFactorAfterWithdraw.toString(10)}
      />
    </TxModalDetails>
  );
};
