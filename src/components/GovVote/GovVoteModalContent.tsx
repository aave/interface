import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TxState } from 'src/helpers/types';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovVoteActions } from './GovVoteActions';

export type GovVoteModalContentProps = {
  handleClose: () => void;
  proposalId: number;
  support: boolean;
};

export interface Asset {
  symbol: string;
  icon: string;
  value: number;
  address: string;
}

export enum ErrorType {
  NOT_ENOUGH_VOTING_POWER,
}

export const GovVoteModalContent = ({
  proposalId,
  support,
  handleClose,
}: GovVoteModalContentProps) => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { votingPower } = useVotingPower();
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [txState, setTxState] = useState<TxState>({ success: false });

  // error states
  const [blockingError, setBlockingError] = useState<ErrorType>();

  // handle delegate address errors
  useEffect(() => {
    if (votingPower === '0') {
      setBlockingError(ErrorType.NOT_ENOUGH_VOTING_POWER);
    } else {
      setBlockingError(undefined);
    }
  }, [votingPower]);
  // render error messages
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_VOTING_POWER:
        return (
          // TODO: fix text
          <Typography>
            <Trans>No voting power</Trans>
          </Typography>
        );
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
          <TxModalTitle title="Governance vote" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
          )}
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
          <TxModalDetails gasLimit={gasLimit} />
        </>
      )}

      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && <TxSuccessView action="Delegation" />}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}

      <GovVoteActions
        setGasLimit={setGasLimit}
        proposalId={proposalId}
        support={support}
        setTxState={setTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
