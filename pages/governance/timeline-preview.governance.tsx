import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalTimeline } from 'src/modules/governance/proposal/ProposalTimeline';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { ProposalDetail, ProposalPayload } from 'src/services/GovernanceCacheService';

// Local, dev-only preview: renders <ProposalTimeline> in every lifecycle state with mocked data so
// all the variations (countdowns, ready-to-x, terminal branches, per-chain payloads) can be
// eyeballed at once. Route: /governance/timeline-preview

const ETH = 1;
const ARB = 42161;
const BASE = 8453;

const baseProposal = (over: Partial<ProposalDetail>): ProposalDetail => ({
  id: '137',
  network: 'ethereum',
  creator: '0x0000000000000000000000000000000000000000',
  accessLevel: 1,
  ipfsHash: '0x',
  title: 'Mock proposal',
  author: 'Aave',
  shortDescription: '',
  description: '',
  discussions: null,
  snapshotBlockHash: '0x',
  votingDuration: '259200', // 3d
  votesFor: '0',
  votesAgainst: '0',
  state: 'created',
  stateId: 1,
  createdAt: null,
  votingActivatedAt: null,
  queuedAt: null,
  executedAt: null,
  failedAt: null,
  cancelledAt: null,
  votingStartTime: null,
  votingEndTime: null,
  l1BlockHash: null,
  votingMachineAddress: null,
  quorum: null,
  requiredDifferential: null,
  cooldownBeforeVotingStart: 86400, // 1d
  ...over,
});

const payload = (
  chainId: number,
  payloadId: number,
  over: Partial<ProposalPayload>
): ProposalPayload => ({
  proposalId: '137',
  payloadId,
  chainId,
  network: '',
  payloadsController: '0x',
  creator: '0x0000000000000000000000000000000000000000',
  maximumAccessLevelRequired: 1,
  state: 'created',
  createdAt: null,
  queuedAt: null,
  executedAt: null,
  cancelledAt: null,
  actions: [],
  ...over,
});

interface Scenario {
  title: string;
  blurb: string;
  proposal: ProposalDetail;
  payloads: ProposalPayload[];
}

const buildScenarios = (): Scenario[] => {
  const nowMs = Date.now();
  const iso = (offsetSec: number) => new Date(nowMs + offsetSec * 1000).toISOString();
  const unix = (offsetSec: number) => String(Math.floor(nowMs / 1000) + offsetSec);
  const H = 3600;
  const D = 86400;

  // three payloads created around proposal creation, used by several scenarios
  const created3 = (createdOffset: number) => [
    payload(ETH, 111, { createdAt: iso(createdOffset) }),
    payload(ARB, 131, { createdAt: iso(createdOffset + 3) }),
    payload(BASE, 55, { createdAt: iso(createdOffset + 6) }),
  ];

  return [
    {
      title: 'Created · cooldown running',
      blurb: 'Voting opens after the creation cooldown — live countdown.',
      proposal: baseProposal({ state: 'created', stateId: 1, createdAt: iso(-1 * H) }),
      payloads: created3(-1 * H),
    },
    {
      title: 'Created · ready to activate',
      blurb: 'Cooldown elapsed, no one has activated voting yet.',
      proposal: baseProposal({ state: 'created', stateId: 1, createdAt: iso(-2 * D) }),
      payloads: created3(-2 * D),
    },
    {
      title: 'Active · voting open',
      blurb: 'Voting window counting down to close.',
      proposal: baseProposal({
        state: 'active',
        stateId: 2,
        createdAt: iso(-3 * D),
        votingActivatedAt: iso(-2 * D),
        votingStartTime: unix(-2 * D),
        votingEndTime: unix(+2 * D),
      }),
      payloads: created3(-3 * D),
    },
    {
      title: 'Active · ready to close',
      blurb: 'Voting ended, waiting on closeAndSendVote.',
      proposal: baseProposal({
        state: 'active',
        stateId: 2,
        createdAt: iso(-5 * D),
        votingActivatedAt: iso(-4 * D),
        votingStartTime: unix(-4 * D),
        votingEndTime: unix(-1 * H),
      }),
      payloads: created3(-5 * D),
    },
    {
      title: 'Queued · execution timelock',
      blurb: 'Vote passed and queued; counting down the execution timelock (placeholder value).',
      proposal: baseProposal({
        state: 'queued',
        stateId: 3,
        createdAt: iso(-6 * D),
        votingActivatedAt: iso(-5 * D),
        votingStartTime: unix(-5 * D),
        votingEndTime: unix(-2 * D),
        queuedAt: iso(-2 * H),
      }),
      payloads: created3(-6 * D),
    },
    {
      title: 'Queued · ready to execute',
      blurb: 'Timelock elapsed — anyone can execute the proposal now.',
      proposal: baseProposal({
        state: 'queued',
        stateId: 3,
        createdAt: iso(-6 * D),
        votingActivatedAt: iso(-5 * D),
        votingStartTime: unix(-5 * D),
        votingEndTime: unix(-2 * D),
        queuedAt: iso(-2 * D),
      }),
      payloads: created3(-6 * D),
    },
    {
      title: 'Executed · payloads executing',
      blurb: 'Proposal dispatched; payloads mid-execution across chains.',
      proposal: baseProposal({
        state: 'executed',
        stateId: 4,
        createdAt: iso(-6 * D),
        votingActivatedAt: iso(-5 * D),
        votingStartTime: unix(-5 * D),
        votingEndTime: unix(-2 * D),
        queuedAt: iso(-1 * D),
        executedAt: iso(-6 * H),
      }),
      payloads: [
        // executed, ready-to-execute (timelock elapsed), and still counting down
        payload(ETH, 111, {
          createdAt: iso(-6 * D),
          queuedAt: iso(-2 * D),
          executedAt: iso(-1 * H),
          state: 'executed',
        }),
        payload(ARB, 131, { createdAt: iso(-6 * D), queuedAt: iso(-2 * D), state: 'queued' }),
        payload(BASE, 55, { createdAt: iso(-6 * D), queuedAt: iso(-5 * H), state: 'queued' }),
      ],
    },
    {
      title: 'Executed · all payloads done',
      blurb: 'Every payload executed on every chain.',
      proposal: baseProposal({
        state: 'executed',
        stateId: 4,
        createdAt: iso(-8 * D),
        votingActivatedAt: iso(-7 * D),
        votingStartTime: unix(-7 * D),
        votingEndTime: unix(-4 * D),
        queuedAt: iso(-3 * D),
        executedAt: iso(-2 * D),
      }),
      payloads: [
        payload(ETH, 111, {
          createdAt: iso(-8 * D),
          queuedAt: iso(-2 * D),
          executedAt: iso(-1 * D),
          state: 'executed',
        }),
        payload(ARB, 131, {
          createdAt: iso(-8 * D),
          queuedAt: iso(-2 * D),
          executedAt: iso(-1 * D),
          state: 'executed',
        }),
        payload(BASE, 55, {
          createdAt: iso(-8 * D),
          queuedAt: iso(-2 * D),
          executedAt: iso(-1 * D),
          state: 'executed',
        }),
      ],
    },
    {
      title: 'Partially executed',
      blurb: 'Some payloads executed, others let their grace window lapse.',
      proposal: baseProposal({
        state: 'partially_executed',
        stateId: 8,
        createdAt: iso(-10 * D),
        votingActivatedAt: iso(-9 * D),
        votingStartTime: unix(-9 * D),
        votingEndTime: unix(-6 * D),
        queuedAt: iso(-5 * D),
        executedAt: iso(-4 * D),
      }),
      payloads: [
        payload(ETH, 111, {
          createdAt: iso(-10 * D),
          queuedAt: iso(-4 * D),
          executedAt: iso(-3 * D),
          state: 'executed',
        }),
        payload(ARB, 131, {
          createdAt: iso(-10 * D),
          queuedAt: iso(-4 * D),
          executedAt: iso(-3 * D),
          state: 'executed',
        }),
        payload(BASE, 55, { createdAt: iso(-10 * D), queuedAt: iso(-4 * D), state: 'expired' }),
      ],
    },
    {
      title: 'Expired',
      blurb: 'Dispatched, but no payload was executed before expiry.',
      proposal: baseProposal({
        state: 'expired',
        stateId: 7,
        createdAt: iso(-12 * D),
        votingActivatedAt: iso(-11 * D),
        votingStartTime: unix(-11 * D),
        votingEndTime: unix(-8 * D),
        queuedAt: iso(-7 * D),
        executedAt: iso(-6 * D),
      }),
      payloads: [
        payload(ETH, 111, { createdAt: iso(-12 * D), queuedAt: iso(-6 * D), state: 'expired' }),
        payload(ARB, 131, { createdAt: iso(-12 * D), queuedAt: iso(-6 * D), state: 'expired' }),
        payload(BASE, 55, { createdAt: iso(-12 * D), queuedAt: iso(-6 * D), state: 'expired' }),
      ],
    },
    {
      title: 'Failed',
      blurb: 'Vote did not reach quorum / differential.',
      proposal: baseProposal({
        state: 'failed',
        stateId: 5,
        createdAt: iso(-4 * D),
        votingActivatedAt: iso(-3 * D),
        votingStartTime: unix(-3 * D),
        votingEndTime: unix(-1 * H),
        failedAt: iso(-30 * 60),
      }),
      payloads: created3(-4 * D),
    },
    {
      title: 'Cancelled',
      blurb: 'Guardian cancelled before voting started.',
      proposal: baseProposal({
        state: 'cancelled',
        stateId: 6,
        createdAt: iso(-1 * H),
        cancelledAt: iso(-30 * 60),
      }),
      payloads: created3(-1 * H),
    },
  ];
};

export default function TimelinePreview() {
  const scenarios = useMemo(buildScenarios, []);

  return (
    <>
      <ProposalTopPanel />
      <ContentContainer>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Timeline states — preview
        </Typography>
        <Typography variant="description" sx={{ color: 'text.secondary', mb: 6, display: 'block' }}>
          Every lifecycle variation of the new ProposalTimeline, rendered with mocked data.
          Countdowns are live.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 460px))' },
            gap: 6,
            alignItems: 'start',
          }}
        >
          {scenarios.map((s) => (
            <Box key={s.title}>
              <Typography variant="subheader1" sx={{ mb: 0.5 }}>
                {s.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.muted', mb: 2, display: 'block' }}>
                {s.blurb}
              </Typography>
              <ProposalTimeline proposal={s.proposal} payloads={s.payloads} />
            </Box>
          ))}
        </Box>
      </ContentContainer>
    </>
  );
}

TimelinePreview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
