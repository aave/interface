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
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { Link } from 'src/components/primitives/Link';
import { EnhancedPayload } from 'src/hooks/governance/usePayloadsData';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';
import invariant from 'tiny-invariant';

const getProposalStateTimestamp = (state: ProposalV3State, proposal: EnhancedProposal): number => {
  switch (state) {
    case ProposalV3State.Null:
      invariant(false, 'Timestamp of a null proposal can not be accessed');
    case ProposalV3State.Created:
      return Number(proposal.proposal.transactions.created.timestamp);
    case ProposalV3State.Active:
      if (proposal.proposal.transactions.active) {
        return Number(proposal.proposal.transactions.active.timestamp);
      }
      return (
        Number(proposal.proposal.transactions.created.timestamp) +
        Number(proposal.proposal.votingConfig.cooldownBeforeVotingStart)
      );
    case ProposalV3State.Queued:
      if (proposal.proposal.transactions.queued) {
        return Number(proposal.proposal.transactions.queued.timestamp);
      }
      if (proposal.proposal.transactions.active) {
        // special case in case the proposal is active but voting has not finished (and tx executed) in the voting machine.
        if (proposal.votingMachineData.proposalData.endTime) {
          return proposal.votingMachineData.proposalData.endTime;
        }
        // special case since proposal.votingDuration gets asigned and locked when proposal is moved to Active.
        return (
          Number(proposal.proposal.transactions.active.timestamp) +
          Number(proposal.proposal.votingDuration)
        );
      }
      // we know that the proposal is not going to be active but using the recursive function for consistency.
      return (
        getProposalStateTimestamp(ProposalV3State.Active, proposal) +
        Number(proposal.proposal.votingConfig.votingDuration)
      );
    case ProposalV3State.Executed:
      if (proposal.proposal.transactions.executed) {
        return Number(proposal.proposal.transactions.executed.timestamp);
      }
      return (
        getProposalStateTimestamp(ProposalV3State.Queued, proposal) +
        Number(proposal.proposal.constants.cooldownPeriod)
      );
    case ProposalV3State.Failed:
      if (proposal.proposal.transactions.failed) {
        return Number(proposal.proposal.transactions.failed.timestamp);
      }
      return getProposalStateTimestamp(ProposalV3State.Queued, proposal);
    case ProposalV3State.Cancelled:
      if (!proposal.proposal.transactions.canceled) {
        // since proposal can be cancelled in almost any state this is only useful in the case we know its canceled since we can't infer the timestamp.
        invariant(
          false,
          'Timestamp of a cancelled proposal can only be accessed if the proposal has been cancelled'
        );
      }
      return Number(proposal.proposal.transactions.canceled.timestamp);
    case ProposalV3State.Expired:
      return (
        Number(proposal.proposal.transactions.created.timestamp) +
        Number(proposal.proposal.constants.expirationTime)
      );
    default:
      invariant(false, 'Unknown proposal state');
  }
};

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
  payloads: EnhancedPayload[] | undefined;
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (payloads === undefined || proposal === undefined) {
    return <></>; // TODO: skeleton
  }

  const proposalState = getLifecycleState(proposal, payloads);

  const createdPayloadOrder = payloads.sort((a, b) => a.createdAt - b.createdAt);

  const coreNetworkConfig = getNetworkConfig(governanceV3Config.coreChainId);

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
        stepName: `Proposal was created`,
        timestamp: formatTime(getProposalStateTimestamp(ProposalV3State.Created, proposal)),
        lastStep: true,
        transactionHash: coreNetworkConfig.explorerLinkBuilder({
          tx: proposal.proposal.transactions.created.id,
        }),
      },
    ]);

  const proposalOpenForVotingSubstates = [
    {
      completed: proposal.proposal.state >= ProposalV3State.Active,
      active: proposalState === ProposalLifecycleStep.OpenForVoting,
      stepName: `Proposal was activated for voting`,
      timestamp: formatTime(getProposalStateTimestamp(ProposalV3State.Active, proposal)),
      transactionHash: proposal.proposal.transactions.active
        ? coreNetworkConfig.explorerLinkBuilder({ tx: proposal.proposal.transactions.active?.id })
        : undefined,
    },
    {
      completed: proposal.votingMachineData.state >= VotingMachineProposalState.Active,
      active: proposalState === ProposalLifecycleStep.OpenForVoting,
      stepName: `Voting started`,
      timestamp: formatTime(getOpenForVotingTimestamp(proposalState, proposal)),
      lastStep: true,
    },
  ];

  const payloadsExecutedSubstates = [
    {
      completed: proposal.proposal.state > ProposalV3State.Queued,
      active: proposal.proposal.state === ProposalV3State.Queued,
      stepName: `Proposal queued`,
      timestamp: formatTime(getProposalStateTimestamp(ProposalV3State.Queued, proposal)),
    },
    {
      completed: proposal.proposal.state >= ProposalV3State.Executed,
      active: proposal.proposal.state === ProposalV3State.Queued,
      stepName: `Proposal executed`,
      timestamp: formatTime(getProposalStateTimestamp(ProposalV3State.Executed, proposal)),
    },
  ]
    .concat(
      payloads.map((payload) => ({
        completed: payload.state >= PayloadState.Queued,
        active: proposal.proposal.state === ProposalV3State.Executed,
        stepName: `Payload ${payload.id} queued`,
        timestamp: payload.queuedAt
          ? formatTime(payload.queuedAt)
          : formatTime(getVotingClosedTimestamp(proposalState, proposal)),
      }))
    )
    .concat(
      payloads.map((payload, index) => ({
        completed: payload.state >= PayloadState.Executed,
        active: payload.state === PayloadState.Queued,
        stepName: `Payload ${payload.id} executed`,
        timestamp: payload.executedAt
          ? formatTime(payload.executedAt)
          : formatTime(getVotingClosedTimestamp(proposalState, proposal) + payload.delay),
        lastStep: index === payloads.length - 1,
      }))
    );

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
          timestamp={formatTime(getProposalStateTimestamp(ProposalV3State.Created, proposal))}
          substeps={proposalCreatedSubsteps}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.OpenForVoting}
          active={proposalState === ProposalLifecycleStep.OpenForVoting}
          stepName={<Trans>Open for voting</Trans>}
          timestamp={formatTime(getOpenForVotingTimestamp(proposalState, proposal))}
          substeps={proposalOpenForVotingSubstates}
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
          substeps={payloadsExecutedSubstates}
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

  if (proposal.votingMachineData.state === VotingMachineProposalState.Active) {
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
  transactionHash?: string;
}

const ProposalStep = ({
  stepName,
  timestamp,
  lastStep,
  completed,
  active,
  substeps,
  transactionHash,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ mt: -1.5 }} variant="main14">
              {stepName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="tooltip" color="text.muted">
                {timestamp}
              </Typography>
              {transactionHash && (
                <DarkTooltip title="View on explorer">
                  <Link href={transactionHash} target="_blank" sx={{ display: 'flex' }}>
                    <SvgIcon sx={{ fontSize: 12 }}>
                      <ExternalLinkIcon />
                    </SvgIcon>
                  </Link>
                </DarkTooltip>
              )}
            </Box>
          </Box>
          {substeps && (
            <IconButton sx={{ p: 0 }} onClick={toggleSubtimeline}>
              {subtimelineOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </Box>
        {substeps && subtimelineOpen && (
          <Timeline>
            {substeps.map((elem) => (
              <ProposalStep key={elem.stepName?.toString()} {...elem} />
            ))}
          </Timeline>
        )}
      </TimelineContent>
    </TimelineItem>
  );
};
