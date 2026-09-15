import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { VoteProposalData } from 'src/modules/governance/types';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovVoteActions } from './GovVoteActions';

export type GovVoteModalContentProps = {
  proposal: VoteProposalData;
  support: boolean;
  power: string;
};

export enum ErrorType {
  NOT_ENOUGH_VOTING_POWER,
}

export const GovVoteModalContent = ({
  proposal,
  support,
  power: votingPower,
}: GovVoteModalContentProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();

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

  const proposalVotingChain = proposal.votingMachineChainId;

  const isWrongNetwork = connectedChainId !== proposalVotingChain;

  const networkConfig = getNetworkConfig(proposalVotingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (txState.success) return <TxSuccessView customText={<Trans>Thank you for voting</Trans>} />;

  return (
    <>
      <TxModalTitle title="Governance vote" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={networkConfig.name}
          chainId={proposalVotingChain}
        />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit} chainId={proposalVotingChain}>
        <DetailsNumberLine description={<Trans>Voting power</Trans>} value={votingPower} />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <GovVoteActions
        proposal={proposal}
        support={support}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
