import { mintAmountsPerToken } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { FaucetActions } from './FaucetActions';

export type FaucetModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {}

export const FaucetModalContent = ({ underlyingAsset, handleClose }: FaucetModalContentProps) => {
  const { reserves } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const networkConfig = getNetworkConfig(currentChainId);

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [faucetTxState, setFaucetTxState] = useState<TxState>({
    success: false,
  });

  const poolReserve = reserves.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()];
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);
  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!faucetTxState.txError && !faucetTxState.success && (
        <>
          <TxModalTitle title="Faucet" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}

          <TxModalDetails
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            faucetAmount={normalizedAmount}
          />
        </>
      )}

      {faucetTxState.txError && <TxErrorView errorMessage={faucetTxState.txError} />}
      {faucetTxState.success && !faucetTxState.txError && (
        <TxSuccessView action="got" symbol={poolReserve.symbol} amount={normalizedAmount} />
      )}
      {faucetTxState.gasEstimationError && (
        <GasEstimationError error={faucetTxState.gasEstimationError} />
      )}

      <FaucetActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setFaucetTxState={setFaucetTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        blocked={false}
      />
    </>
  );
};
