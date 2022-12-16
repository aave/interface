import { Trans } from '@lingui/macro';
import { useModalContext } from 'src/hooks/useModal';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { FaucetActions } from './FaucetActions';
import { getNormalizedMintAmount } from './utils';

export type FaucetModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {}

export const FaucetModalContent = ({ poolReserve, isWrongNetwork }: ModalWrapperProps) => {
  const { gasLimit, mainTxState: faucetTxState, txError } = useModalContext();

  const normalizedAmount = getNormalizedMintAmount(poolReserve.symbol, poolReserve.decimals);

  if (faucetTxState.success)
    return (
      <TxSuccessView
        txHash={faucetTxState.txHash || ''}
        action={<Trans>Received</Trans>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    );

  return (
    <>
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <FaucetActions poolReserve={poolReserve} isWrongNetwork={isWrongNetwork} blocked={false} />
    </>
  );
};
