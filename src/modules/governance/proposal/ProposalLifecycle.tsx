import {
  Payload,
  PayloadState,
  ProposalV3State,
  VotingMachineProposalState,
} from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Button, IconButton, Paper, SvgIcon, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { ReactNode, useState } from 'react';
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
  Done,
}

export const ProposalLifecycle = ({
  proposal,
  payloads,
}: {
  proposal: EnhancedProposal | undefined;
  payloads: Payload[] | undefined;
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (payloads === undefined || proposal === undefined) {
    return <></>; // TODO: skeleton
  }

  const proposalState = getLifecycleState(proposal, payloads);

  const createdPayloadOrder = payloads.sort((a, b) => a.createdAt - b.createdAt);

  const proposalCreatedSubsteps = createdPayloadOrder
    .map<ProposalStepProps>((payload) => ({
      completed: true,
      active: proposalState === ProposalLifecycleStep.Created,
      stepName: `Payload ${payload.id} was created`,
      timestamp: formatTime(payload.createdAt),
    }))
    .concat([
      {
        completed: true,
        active: proposalState === ProposalLifecycleStep.Created,
        stepName: `Proposal ${proposal.proposal.id} was created`,
        timestamp: formatTime(+proposal.proposal.transactions.created.timestamp),
        lastStep: true,
      },
    ]);

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
  const discussionUrl = proposal.proposal.proposalMetadata.discussions.match(urlRegex);

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
          timestamp={formatTime(+proposal.proposal.transactions.created.timestamp)}
          substeps={proposalCreatedSubsteps}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.OpenForVoting}
          active={proposalState === ProposalLifecycleStep.OpenForVoting}
          stepName={<Trans>Open for voting</Trans>}
          timestamp={formatTime(getOpenForVotingTimestamp(proposalState, proposal))}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.VotingClosed}
          active={proposalState === ProposalLifecycleStep.VotingClosed}
          stepName={votingClosedStepLabel}
          timestamp={formatTime(getVotingClosedTimestamp(proposalState, proposal))}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.PayloadsExecuted}
          active={proposalState === ProposalLifecycleStep.PayloadsExecuted}
          stepName={<Trans>Payloads executed</Trans>}
          timestamp={formatTime(getPayloadsExecutedTimestamp(proposalState, proposal, payloads))}
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
              AIP: proposal.proposal.id,
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
  if (proposal.proposal.state === ProposalV3State.Created) {
    return ProposalLifecycleStep.Created;
  }

  if (proposal.proposal.state === ProposalV3State.Active) {
    return ProposalLifecycleStep.OpenForVoting;
  }

  if (
    proposal.votingMachineData.state === VotingMachineProposalState.Finished ||
    proposal.proposal.state === ProposalV3State.Queued
  ) {
    return ProposalLifecycleStep.VotingClosed;
  }

  if (proposal.proposal.state === ProposalV3State.Executed) {
    const payloadsExecuted = payloads.every((payload) => payload.state === PayloadState.Executed);
    if (payloadsExecuted) {
      return ProposalLifecycleStep.Done;
    } else {
      return ProposalLifecycleStep.PayloadsExecuted;
    }
  }

  if (proposal.proposal.state === ProposalV3State.Cancelled) {
    return ProposalLifecycleStep.Cancelled;
  }

  if (proposal.proposal.state === ProposalV3State.Expired) {
    return ProposalLifecycleStep.Expired;
  }

  return ProposalLifecycleStep.Done;
};

const getOpenForVotingTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal
) => {
  const votingMachineStartTime = proposal.votingMachineData.proposalData.startTime;
  if (currentState === ProposalLifecycleStep.Created || votingMachineStartTime === 0) {
    const creationTime = +proposal.proposal.transactions.created.timestamp;
    const votingStartDelay = proposal.proposal.votingConfig.cooldownBeforeVotingStart;
    return creationTime + Number(votingStartDelay);
  }

  return proposal.votingMachineData.proposalData.startTime;
};

const getVotingClosedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal
) => {
  const votingMachineEndTime = proposal.votingMachineData.proposalData.endTime;
  if (currentState === ProposalLifecycleStep.Created || votingMachineEndTime === 0) {
    const votingDuration = proposal.proposal.votingConfig.votingDuration;
    return getOpenForVotingTimestamp(currentState, proposal) + Number(votingDuration);
  }

  return proposal.votingMachineData.proposalData.endTime;
};

const getPayloadsExecutedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
  payloads: Payload[]
) => {
  const executedAt = payloads.map((p) => p.executedAt).sort((a, b) => b - a)[0];
  if (currentState === ProposalLifecycleStep.Created || executedAt === 0) {
    const executionDelay = payloads[0].delay;
    return getVotingClosedTimestamp(currentState, proposal) + Number(executionDelay);
  }

  return executedAt;
};

const formatTime = (timestamp: number) => {
  return dayjs.unix(timestamp).format('MMM D, YYYY h:mm A');
};

interface ProposalStepProps {
  stepName: ReactNode;
  timestamp: string;
  lastStep?: boolean;
  completed?: boolean;
  active?: boolean;
  substeps?: ProposalStepProps[];
}

const ProposalStep = ({
  stepName,
  timestamp,
  lastStep,
  completed,
  active,
  substeps,
}: ProposalStepProps) => {
  const theme = useTheme();
  const [subtimelineOpen, setSubtimelineOpen] = useState(false);

  const toggleSubtimeline = () => {
    setSubtimelineOpen((open) => !open);
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ mt: -1.5 }} variant="main14">
              {stepName}
            </Typography>
            <Typography variant="tooltip" color="text.muted">
              {timestamp}
            </Typography>
          </Box>
          {substeps && (
            <IconButton onClick={toggleSubtimeline}>
              {subtimelineOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </Box>
        {substeps && subtimelineOpen && (
          <Timeline>
            {substeps.map((elem) => (
              <ProposalStep key={elem.timestamp} {...elem} />
            ))}
          </Timeline>
        )}
      </TimelineContent>
    </TimelineItem>
  );
};
