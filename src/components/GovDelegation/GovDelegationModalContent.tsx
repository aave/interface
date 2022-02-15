import { Trans } from '@lingui/macro';
import { Button, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TxState } from 'src/helpers/types';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';

export type GovDelegationModalContentProps = {
  handleClose: () => void;
};

export interface Asset {
  symbol: string;
  icon: string;
  value: number;
  address: string;
}

export const DELEGATED_ASSETS = [
  {
    symbol: 'AAVE',
  },
  {
    symbol: 'stkAAVE',
  },
];

export enum DELEGATION_PARAM_TYPES {
  VOTING = '0',
  PROPOSITION_POWER = '1',
}

export const delegationTypes = [
  {
    value: DELEGATION_PARAM_TYPES.VOTING,
    label: 'Voting power',
  },
  {
    value: DELEGATION_PARAM_TYPES.PROPOSITION_POWER,
    label: 'Proposition power',
  },
];

export enum ErrorType {}

export const GovDelegationModalContent = ({ handleClose }: GovDelegationModalContentProps) => {
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [txState, setTxState] = useState<TxState>({ success: false });

  // error states
  const [tokenBlockingError, setTokenBlockingError] = useState<ErrorType | undefined>();
  const [delegateeBlockingError, setDelegateeBlockingError] = useState<ErrorType | undefined>();

  // selector states
  const [selectedToken, setSelectedToken] = useState();

  // render error messages
  const handleTokenBlocked = () => {
    switch (tokenBlockingError) {
      default:
        return null;
    }
  };

  // render error messages
  const handleDelegateeBlocked = () => {
    switch (delegateeBlockingError) {
      default:
        return null;
    }
  };

  // is Network mismatched
  const govChain = governanceConfig?.chainId || 1;
  const networkConfig = getNetworkConfig(govChain);
  const isWrongNetwork = connectedChainId !== govChain;

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Governance delegation" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
          )}
          {/* {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )} */}
          {/* Add token selector */}
          {/* Add delegation type selector */}
          {/* Add input address */}
          <TxModalDetails gasLimit={gasLimit} />
        </>
      )}

      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && <TxSuccessView action="Delegation" />}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}

      {/* <GovDelegationActions
        setGasLimit={setGasLimit}
        setEmodeTxState={setEmodeTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        selectedEmode={selectedEmode?.id || 0}
      /> */}
    </>
  );
};
