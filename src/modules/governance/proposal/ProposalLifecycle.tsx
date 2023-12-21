import {
  Payload,
  PayloadState,
  ProposalV3State,
  VotingConfig,
  VotingMachineProposalState,
} from '@aave/contract-helpers';
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
import { Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';

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
  if (payloads === undefined || proposal === undefined || votingConfig === undefined) {
    return <></>; // TODO: skeleton
  }

  const proposalState = getLifecycleState(proposal, payloads);

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
          state={
            proposalState >= ProposalLifecycleStep.Created ? StepState.Completed : StepState.Active
          }
          stepName={<Trans>Created</Trans>}
          timestamp={formatTime(proposal.proposalData.proposalData.creationTime)}
        />
        <ProposalStep
          state={
            proposalState > ProposalLifecycleStep.OpenForVoting
              ? StepState.Completed
              : StepState.Active
          }
          stepName={<Trans>Open for voting</Trans>}
          timestamp={formatTime(getOpenForVotingTimestamp(proposalState, proposal, votingConfig))}
        />
        <ProposalStep
          state={
            proposalState > ProposalLifecycleStep.VotingClosed
              ? StepState.Completed
              : StepState.Active
          }
          stepName={<Trans>Voting closed</Trans>}
          timestamp={formatTime(getVotingClosedTimestamp(proposalState, proposal, votingConfig))}
        />
        <ProposalStep
          state={
            proposalState === ProposalLifecycleStep.PayloadsExecuted
              ? StepState.Completed
              : StepState.Active
          }
          stepName={<Trans>Payloads executed</Trans>}
          timestamp={formatTime(
            getPayloadsExecutedTimestamp(proposalState, proposal, votingConfig, payloads)
          )}
          lastStep
        />
      </Timeline>
    </Paper>
  );
};

const getLifecycleState = (proposal: EnhancedProposal, payloads: Payload[]) => {
  if (proposal.proposalData.proposalData.state === ProposalV3State.Created) {
    console.log('created');
    return ProposalLifecycleStep.Created;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Active) {
    console.log('open for voting');
    return ProposalLifecycleStep.OpenForVoting;
  }

  if (proposal.votingMachineData.state === VotingMachineProposalState.Finished) {
    console.log('voting closed');
    return ProposalLifecycleStep.VotingClosed;
  }

  const payloadsExecuted = payloads.every((payload) => payload.state === PayloadState.Executed);
  if (payloadsExecuted) {
    console.log('payloads executed');
    return ProposalLifecycleStep.PayloadsExecuted;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Cancelled) {
    console.log('cancelled');
    return ProposalLifecycleStep.Cancelled;
  }

  if (proposal.proposalData.proposalData.state === ProposalV3State.Expired) {
    console.log('expired');
    return ProposalLifecycleStep.Expired;
  }

  console.log('default - created');
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

enum StepState {
  Completed,
  Active,
}

const ProposalStep = ({
  stepName,
  timestamp,
  state,
  lastStep,
}: {
  stepName: ReactNode;
  timestamp: string;
  state: StepState;
  lastStep?: boolean;
}) => {
  const theme = useTheme();
  const dotColor =
    state === StepState.Completed ? theme.palette.primary.main : theme.palette.text.disabled;
  const connectorColor =
    state === StepState.Completed ? theme.palette.primary.main : theme.palette.text.disabled;
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          sx={{ background: dotColor }}
          variant={state === StepState.Active ? 'outlined' : 'filled'}
        />
        {!lastStep && <TimelineConnector sx={{ background: connectorColor }} />}
      </TimelineSeparator>
      <TimelineContent>
        <Typography sx={{ mt: 0.5 }} variant="main14">
          {stepName}
        </Typography>
        <Typography variant="tooltip" color="text.muted">
          {timestamp}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};
