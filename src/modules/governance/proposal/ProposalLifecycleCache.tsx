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
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { ProposalDetail, ProposalPayload } from 'src/services/GovernanceCacheService';
import { useRootStore } from 'src/store/root';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { GENERAL } from 'src/utils/events';

const getNetworkName = (chainId: number) =>
  networkConfigs[chainId as keyof typeof networkConfigs]?.name || `Chain ${chainId}`;

const getNetworkLogo = (chainId: number) =>
  networkConfigs[chainId as keyof typeof networkConfigs]?.networkLogoPath;

interface ProposalLifecycleCacheProps {
  proposal?: ProposalDetail | null;
  payloads?: ProposalPayload[];
  payloadsLoading?: boolean;
}

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return 'Pending';
  const date = new Date(timestamp);
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

const formatUnixTime = (timestamp: string | null) => {
  if (!timestamp) return 'Pending';
  return dayjs.unix(parseInt(timestamp, 10)).format('MMM D, YYYY h:mm A');
};

interface StepProps {
  stepName: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
  lastStep?: boolean;
  isUnix?: boolean;
  networkLogo?: string;
  substeps?: StepProps[];
}

const ProposalStep = ({
  stepName,
  timestamp,
  completed,
  active,
  lastStep,
  isUnix,
  networkLogo,
  substeps,
}: StepProps) => {
  const theme = useTheme();
  const [subtimelineOpen, setSubtimelineOpen] = useState(false);

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
      <TimelineContent sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 0 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {networkLogo && <Avatar sx={{ width: 16, height: 16, mr: 2 }} src={networkLogo} />}
              <Typography variant="main14">
                <Trans>{stepName}</Trans>
              </Typography>
            </Box>
            <Typography variant="tooltip" color="text.muted">
              {isUnix ? formatUnixTime(timestamp) : formatTime(timestamp)}
            </Typography>
          </Box>
          {substeps && substeps.length > 0 && (
            <IconButton
              sx={{ p: 0, ml: 'auto' }}
              onClick={() => setSubtimelineOpen(!subtimelineOpen)}
            >
              {subtimelineOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </Box>
        {substeps && subtimelineOpen && (
          // @ts-expect-error TODO: MUI lab Timeline type mismatch
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {substeps.map((step, index) => (
              <ProposalStep key={`${step.stepName}-${index}`} {...step} />
            ))}
          </Timeline>
        )}
      </TimelineContent>
    </TimelineItem>
  );
};

export const ProposalLifecycleCache = ({
  proposal,
  payloads,
  payloadsLoading,
}: ProposalLifecycleCacheProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (!proposal || payloadsLoading) {
    return (
      <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
        <Skeleton height={200} />
      </Paper>
    );
  }

  const state = proposal.state;
  const stateOrder = ['created', 'active', 'queued', 'executed', 'failed', 'cancelled'];
  const currentStateIndex = stateOrder.indexOf(state);

  // Build payload creation substeps
  const payloadCreationSubsteps: StepProps[] = (payloads || []).map((p) => ({
    stepName: `Payload ${p.payloadId} created on ${getNetworkName(p.chainId)}`,
    timestamp: p.createdAt,
    completed: true,
    active: false,
    networkLogo: getNetworkLogo(p.chainId),
  }));

  // Add proposal creation as last substep
  payloadCreationSubsteps.push({
    stepName: 'Proposal created',
    timestamp: proposal.createdAt,
    completed: true,
    active: false,
    lastStep: true,
    networkLogo: getNetworkLogo(1),
  });

  // Build payload execution substeps
  const payloadExecutionSubsteps: StepProps[] = [];

  // Proposal queued
  payloadExecutionSubsteps.push({
    stepName: 'Proposal queued',
    timestamp: proposal.queuedAt,
    completed: !!proposal.queuedAt,
    active: state === 'queued' && !proposal.executedAt,
    networkLogo: getNetworkLogo(1),
  });

  // Proposal executed (GovernanceCore dispatched payloads cross-chain)
  payloadExecutionSubsteps.push({
    stepName: 'Proposal executed',
    timestamp: proposal.executedAt,
    completed: !!proposal.executedAt,
    active: false,
    networkLogo: getNetworkLogo(1),
  });

  // Per-chain payload queued and executed
  (payloads || []).forEach((p) => {
    // Only show queued substep if there's an actual queued timestamp
    if (p.queuedAt || p.state === 'queued') {
      payloadExecutionSubsteps.push({
        stepName: `Payload ${p.payloadId} queued on ${getNetworkName(p.chainId)}`,
        timestamp: p.queuedAt,
        completed: !!p.queuedAt,
        active: p.state === 'queued',
        networkLogo: getNetworkLogo(p.chainId),
      });
    }
    payloadExecutionSubsteps.push({
      stepName: `Payload ${p.payloadId} executed on ${getNetworkName(p.chainId)}`,
      timestamp: p.executedAt,
      completed: p.state === 'executed',
      active: false,
      networkLogo: getNetworkLogo(p.chainId),
    });
  });

  // Mark last substep
  if (payloadExecutionSubsteps.length > 0) {
    payloadExecutionSubsteps[payloadExecutionSubsteps.length - 1].lastStep = true;
  }

  const steps: StepProps[] = [
    {
      stepName: 'Created',
      timestamp: proposal.createdAt,
      completed: currentStateIndex >= 0,
      active: state === 'created',
      substeps: payloadCreationSubsteps.length > 1 ? payloadCreationSubsteps : undefined,
    },
    {
      stepName: 'Open for voting',
      timestamp: proposal.votingStartTime,
      completed: currentStateIndex >= 1,
      active: state === 'active',
      isUnix: true,
    },
    {
      stepName: 'Voting closed',
      timestamp: proposal.votingEndTime,
      completed: currentStateIndex >= 2,
      active: false,
      isUnix: true,
    },
  ];

  // Add final state step
  const allPayloadsExecuted = (payloads || []).every((p) => p.state === 'executed');

  if (state === 'queued' || state === 'executed') {
    steps.push({
      stepName: 'Payloads executed',
      timestamp: allPayloadsExecuted ? proposal.executedAt : proposal.queuedAt,
      completed: state === 'executed' && allPayloadsExecuted,
      active: (state === 'executed' && !allPayloadsExecuted) || state === 'queued',
      lastStep: true,
      substeps: payloadExecutionSubsteps,
    });
  } else if (state === 'failed') {
    steps.push({
      stepName: 'Failed',
      timestamp: proposal.failedAt,
      completed: true,
      active: false,
      lastStep: true,
    });
  } else if (state === 'cancelled') {
    steps.push({
      stepName: 'Cancelled',
      timestamp: proposal.cancelledAt,
      completed: true,
      active: false,
      lastStep: true,
    });
  } else {
    // Mark last step for pending proposals
    steps[steps.length - 1].lastStep = true;
  }

  // Extract discussion URL
  const discussionUrl = proposal.discussions?.match(/https?:\/\/[^\s"]+/)?.[0];

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <Trans>Proposal details</Trans>
      </Typography>

      {/* @ts-expect-error TODO: MUI lab Timeline type mismatch */}
      <Timeline
        position="right"
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {steps.map((step, index) => (
          <ProposalStep key={`${step.stepName}-${index}`} {...step} />
        ))}
      </Timeline>

      {discussionUrl && (
        <Button
          component={Link}
          target="_blank"
          rel="noopener"
          onClick={() =>
            trackEvent(GENERAL.EXTERNAL_LINK, {
              AIP: proposal.id,
              Link: 'Forum Discussion',
            })
          }
          href={discussionUrl}
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
