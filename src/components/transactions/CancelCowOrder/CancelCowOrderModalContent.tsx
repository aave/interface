import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  ActionName,
  isCowSwapSubset,
  SwapActionFields,
  TransactionHistoryItem,
} from 'src/modules/history/types';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits } from 'viem';

import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { DetailsNumberLine, DetailsTextLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { CancelAdapterOrderActions } from './CancelAdapterOrderActions';
import { CancelCowOrderActions } from './CancelCowOrderActions';

interface CancelCowOrderModalContentProps {
  cowOrder: TransactionHistoryItem<
    | SwapActionFields[ActionName.Swap]
    | SwapActionFields[ActionName.CollateralSwap]
    | SwapActionFields[ActionName.DebtSwap]
    | SwapActionFields[ActionName.RepayWithCollateral]
    | SwapActionFields[ActionName.WithdrawAndSwap]
  >;
}

export const CancelCowOrderModalContent = ({ cowOrder }: CancelCowOrderModalContentProps) => {
  const { name } = getNetworkConfig(cowOrder.chainId);
  const { isWrongNetwork } = useIsWrongNetwork(cowOrder.chainId);
  const { readOnlyMode } = useWeb3Context();
  const { mainTxState, txError } = useModalContext();

  const showNetworkWarning = isWrongNetwork && !readOnlyMode;

  if (mainTxState.success) {
    // Show explorer link if txHash exists (adapter cancellations have txHash)
    const hasTxHash = !!mainTxState.txHash;

    return (
      <BaseSuccessView hideTx={!hasTxHash} txHash={mainTxState.txHash}>
        <Typography sx={{ mt: 4 }} variant="h2">
          <Trans>Cancellation submited</Trans>
        </Typography>
      </BaseSuccessView>
    );
  }

  return (
    <>
      {showNetworkWarning && <ChangeNetworkWarning networkName={name} chainId={cowOrder.chainId} />}
      <TxModalDetails showGasStation={false}>
        <Typography variant="h2">
          <Trans>Cancel order</Trans>
        </Typography>
        <Typography sx={{ mt: 2, mb: 4 }} variant="description" color="text.secondary">
          {isCowSwapSubset(cowOrder) && cowOrder.usedAdapter ? (
            <Trans>
              This will cancel the order via an on-chain transaction. Note that the order will not
              be marked as cancelled in the CoW Protocol system, but will remain open and expire
              naturally. Keep in mind that a solver may already have filled your order.
            </Trans>
          ) : (
            <Trans>
              This is an off-chain operation. Keep in mind that a solver may already have filled
              your order.
            </Trans>
          )}
        </Typography>
        <DetailsTextLine
          description="Order ID"
          text={cowOrder.id}
          compactedProps={{ compact: true }}
        />
        <DetailsNumberLine
          description="From"
          value={formatUnits(BigInt(cowOrder.srcAmount), cowOrder.underlyingSrcToken.decimals)}
          symbol={cowOrder.underlyingSrcToken.symbol}
        />
        <DetailsNumberLine
          description="To"
          value={formatUnits(BigInt(cowOrder.destAmount), cowOrder.underlyingDestToken.decimals)}
          symbol={cowOrder.underlyingDestToken.symbol}
        />
      </TxModalDetails>
      {txError && <GasEstimationError txError={txError} />}
      {isCowSwapSubset(cowOrder) && cowOrder.usedAdapter && cowOrder.adapterInstanceAddress ? (
        <CancelAdapterOrderActions
          cowOrder={
            cowOrder as TransactionHistoryItem<
              | SwapActionFields[ActionName.DebtSwap]
              | SwapActionFields[ActionName.RepayWithCollateral]
              | SwapActionFields[ActionName.CollateralSwap]
            >
          }
          blocked={false}
        />
      ) : (
        <CancelCowOrderActions
          cowOrder={cowOrder as TransactionHistoryItem<SwapActionFields[ActionName.Swap]>}
          blocked={false}
        />
      )}
    </>
  );
};
