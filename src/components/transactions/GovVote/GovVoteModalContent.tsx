import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovVoteActions } from './GovVoteActions';

export type GovVoteModalContentProps = {
  proposalId: number;
  support: boolean;
  power: string;
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
  power: votingPower,
}: GovVoteModalContentProps) => {
  const { chainId: connectedChainId, watchModeOnlyAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();

  // handle delegate address errors
  let blockingError: ErrorType | undefined = undefined;
  if (votingPower === '0') {
    blockingError = ErrorType.NOT_ENOUGH_VOTING_POWER;
  }
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
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId
      ? currentChainId
      : governanceConfig.chainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success) return <TxSuccessView action={<Trans>Vote</Trans>} />;

  return (
    <>
      <TxModalTitle title="Governance vote" />
      {isWrongNetwork && !watchModeOnlyAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine description={<Trans>Voting power</Trans>} value={votingPower} />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <GovVoteActions
        proposalId={proposalId}
        support={support}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
