import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ActionName, SwapActionFields, TransactionHistoryItem } from 'src/modules/history/types';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits } from 'viem';

import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { DetailsNumberLine, DetailsTextLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { CancelCowOrderActions } from './CancelCowOrderActions';

interface CancelCowOrderModalContentProps {
  cowOrder: TransactionHistoryItem<SwapActionFields[ActionName.Swap]>;
}

export const CancelCowOrderModalContent = ({ cowOrder }: CancelCowOrderModalContentProps) => {
  const { name } = getNetworkConfig(cowOrder.chainId);
  const { isWrongNetwork } = useIsWrongNetwork(cowOrder.chainId);
  const { readOnlyMode } = useWeb3Context();
  const { mainTxState, txError } = useModalContext();

  const showNetworkWarning = isWrongNetwork && !readOnlyMode;

  if (mainTxState.success) {
    return (
      <BaseSuccessView hideTx={true}>
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
      <CancelCowOrderActions cowOrder={cowOrder} blocked={false} />
    </>
  );
};
