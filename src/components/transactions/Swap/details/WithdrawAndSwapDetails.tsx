import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { useShallow } from 'zustand/shallow';

import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { ProtocolSwapParams, ProtocolSwapState } from '../types';

export const WithdrawAndSwapDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();
  const { currentNetworkConfig } = useRootStore(
    useShallow((store) => ({ currentNetworkConfig: store.currentNetworkConfig }))
  );

  if (!user) {
    return null;
  }

  const underlyingBalance = valueToBigNumber(state.sourceReserve.underlyingBalance);
  const withdrawAmount = state.inputAmount;
  const poolReserve = state.sourceReserve.reserve;

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve: state.sourceReserve,
    poolReserve,
    withdrawAmount,
  });

  //   const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();

  // TODO: add to error component
  //   const { blockingError, errorComponent } = useWithdrawError({
  //     assetsBlockingWithdraw,
  //     poolReserve,
  //     healthFactorAfterWithdraw,
  //     withdrawAmount,
  //     user,
  //   });

  return (
    <TxModalDetails gasLimit={state.gasLimit}>
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
