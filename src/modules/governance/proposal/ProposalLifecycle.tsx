import {
  Payload,
  PayloadState,
  ProposalV3State,
  VotingConfig,
  VotingMachineProposalState,
} from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';
import { Button, Paper, SvgIcon, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Link } from 'src/components/primitives/Link';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

enum ProposalLifecycleStep {
  Created,
  OpenForVoting,
  VotingClosed,
  PayloadsExecuted,
  Cancelled,
  Expired,
}

export const ProposalLifecycle = ({
  proposal,
  payloads,
  votingConfig,
}: {
  proposal: EnhancedProposal | undefined;
  payloads: Payload[] | undefined;
  votingConfig: VotingConfig | undefined;
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (payloads === undefined || proposal === undefined || votingConfig === undefined) {
    return <></>; // TODO: skeleton
  }

  const proposalState = getLifecycleState(proposal, payloads);

  const votingClosedStepLabel = <Trans>Voting closed</Trans>;
  // TODO: show if passed/failed
  // if (proposalState >= ProposalLifecycleStep.VotingClosed) {
  // proposal.votingMachineData.
  // votingClosedStepLabel = (
  //   <>
  //     <Trans>Voting closed</Trans>
  //     {'Passed'}
  //   </>
  // );
  // }

  const urlRegex = /https?:\/\/[^\s"]+/g;
  const discussionUrl = proposal.proposal.discussions.match(urlRegex);

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <Trans>Proposal details</Trans>
      </Typography>
      <Timeline
        position="right"
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.Created}
          active={proposalState === ProposalLifecycleStep.Created}
          stepName={<Trans>Created</Trans>}
          timestamp={formatTime(proposal.proposalData.proposalData.creationTime)}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.OpenForVoting}
          active={proposalState === ProposalLifecycleStep.OpenForVoting}
          stepName={<Trans>Open for voting</Trans>}
          timestamp={formatTime(getOpenForVotingTimestamp(proposalState, proposal, votingConfig))}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.VotingClosed}
          active={proposalState === ProposalLifecycleStep.VotingClosed}
          stepName={votingClosedStepLabel}
          timestamp={formatTime(getVotingClosedTimestamp(proposalState, proposal, votingConfig))}
        />
        <ProposalStep
          completed={proposalState >= ProposalLifecycleStep.PayloadsExecuted}
          stepName={<Trans>Payloads executed</Trans>}
          timestamp={formatTime(
            getPayloadsExecutedTimestamp(proposalState, proposal, votingConfig, payloads)
          )}
          lastStep
        />
      </Timeline>
      {discussionUrl && (
        <Button
          component={Link}
          target="_blank"
          rel="noopener"
          onClick={() =>
            trackEvent(GENERAL.EXTERNAL_LINK, {
              AIP: proposal.proposalData.id,
              Link: 'Forum Discussion',
            })
          }
          href={discussionUrl[0]}
          variant="outlined"
          endIcon={
            <SvgIcon>
              <ExternalLinkIcon />
            </SvgIcon>
          }
        >
          <Trans>Forum discussion</Trans>
        </Button>
      )}
    </Paper>
  );
};

const getLifecycleState = (proposal: EnhancedProposal, payloads: Payload[]) => {
  if (proposal.proposalData.proposalData.state === ProposalV3State.Created) {
    return ProposalLifecycleStep.Created;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Active) {
    return ProposalLifecycleStep.OpenForVoting;
  }

  if (proposal.votingMachineData.state === VotingMachineProposalState.Finished) {
    return ProposalLifecycleStep.VotingClosed;
  }

  const payloadsExecuted = payloads.every((payload) => payload.state === PayloadState.Executed);
  if (payloadsExecuted) {
    return ProposalLifecycleStep.PayloadsExecuted;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Cancelled) {
    return ProposalLifecycleStep.Cancelled;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Expired) {
    return ProposalLifecycleStep.Expired;
  }

  return ProposalLifecycleStep.Created; // TODO
};

const getOpenForVotingTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
  votingConfig: VotingConfig
) => {
  const votingMachineStartTime = proposal.votingMachineData.proposalData.startTime;
  if (currentState === ProposalLifecycleStep.Created || votingMachineStartTime === 0) {
    const creationTime = proposal.proposalData.proposalData.creationTime;
    const votingStartDelay = votingConfig.config.coolDownBeforeVotingStart;
    return creationTime + Number(votingStartDelay);
  }

  return proposal.votingMachineData.proposalData.startTime;
};

const getVotingClosedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
  votingConfig: VotingConfig
) => {
  const votingMachineEndTime = proposal.votingMachineData.proposalData.endTime;
  if (currentState === ProposalLifecycleStep.Created || votingMachineEndTime === 0) {
    const votingDuration = votingConfig.config.votingDuration;
    return getOpenForVotingTimestamp(currentState, proposal, votingConfig) + Number(votingDuration);
  }

  return proposal.votingMachineData.proposalData.endTime;
};

const getPayloadsExecutedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
  votingConfig: VotingConfig,
  payloads: Payload[]
) => {
  const executedAt = payloads.map((p) => p.executedAt).sort((a, b) => b - a)[0];
  if (currentState === ProposalLifecycleStep.Created || executedAt === 0) {
    const executionDelay = payloads[0].delay;
    return getVotingClosedTimestamp(currentState, proposal, votingConfig) + Number(executionDelay);
  }

  return executedAt;
};

const formatTime = (timestamp: number) => {
  return dayjs.unix(timestamp).format('MMM D, YYYY h:mm A');
};

const ProposalStep = ({
  stepName,
  timestamp,
  lastStep,
  completed,
  active,
}: {
  stepName: ReactNode;
  timestamp: string;
  lastStep?: boolean;
  completed?: boolean;
  active?: boolean;
}) => {
  const theme = useTheme();

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            background: completed
              ? theme.palette.primary.main
              : active
              ? 'unset'
              : theme.palette.text.disabled,
            borderColor:
              completed || active ? theme.palette.primary.main : theme.palette.text.disabled,
            my: 1,
          }}
          variant={active ? 'outlined' : 'filled'}
        />
        {!lastStep && (
          <TimelineConnector
            sx={{
              background: completed ? theme.palette.primary.main : theme.palette.text.disabled,
            }}
          />
        )}
      </TimelineSeparator>
      <TimelineContent>
        <Typography sx={{ mt: -1.5 }} variant="main14">
          {stepName}
        </Typography>
        <Typography variant="tooltip" color="text.muted">
          {timestamp}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};
