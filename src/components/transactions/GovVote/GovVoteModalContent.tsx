import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { Proposal } from 'src/hooks/governance/useProposals';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { AIP } from 'src/utils/mixPanelEvents';

import { LensIcon } from '../../../components/icons/LensIcon';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovVoteActions } from './GovVoteActions';

export type GovVoteModalContentProps = {
  proposal: Proposal;
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
  proposal,
  support,
  power: votingPower,
}: GovVoteModalContentProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { palette } = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

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

  const proposalVotingChain = +proposal.subgraphProposal.votingPortal.votingMachineChainId;

  const isWrongNetwork = connectedChainId !== proposalVotingChain;

  const networkConfig = getNetworkConfig(proposalVotingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (txState.success)
    return (
      <TxSuccessView
        customAction={
          <Box mt={5}>
            <Button
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(AIP.SHARE_VOTE_ON_LENS)}
              href={`https://hey.xyz/?url=${
                window.location.href
              }&text=${`I just voted on the latest active proposal on aave governance`}&hashtags=Aave&preview=true`}
              startIcon={
                <LensIcon
                  color={palette.mode === 'dark' ? palette.primary.light : palette.text.primary}
                />
              }
            >
              <Trans>Share on Lens</Trans>
            </Button>
          </Box>
        }
        customText={<Trans>Thank you for voting!!</Trans>}
      />
    );

  return (
    <>
      <TxModalTitle title="Governance vote" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={proposalVotingChain} />
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
