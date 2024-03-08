import { alpha, experimental_sx, Skeleton, styled } from '@mui/material';
import invariant from 'tiny-invariant';

import { ProposalLifecycleStep, ProposalVoteInfo } from './utils/formatProposal';

interface StateBadgeProps {
  state?: ProposalBadgeState;
  loading?: boolean;
}

export enum ProposalBadgeState {
  Created = 'Created',
  OpenForVoting = 'Open for voting',
  Passed = 'Passed',
  Failed = 'Failed',
  Executed = 'Executed',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

type BadgeProps = {
  state: ProposalBadgeState;
};

export const lifecycleToBadge = (
  step: ProposalLifecycleStep,
  votingInfo: ProposalVoteInfo
): ProposalBadgeState => {
  switch (step) {
    case ProposalLifecycleStep.Null:
      invariant(false, 'Proposal state is null');
    case ProposalLifecycleStep.Created:
      return ProposalBadgeState.Created;
    case ProposalLifecycleStep.OpenForVoting:
      return ProposalBadgeState.OpenForVoting;
    case ProposalLifecycleStep.VotingClosed:
      return votingInfo.isPassing ? ProposalBadgeState.Passed : ProposalBadgeState.Failed;
    case ProposalLifecycleStep.Executed:
      return ProposalBadgeState.Executed;
    case ProposalLifecycleStep.Cancelled:
      return ProposalBadgeState.Cancelled;
    case ProposalLifecycleStep.Expired:
      return ProposalBadgeState.Expired;
  }
};

const Badge = styled('span')<BadgeProps>(({ theme, state }) => {
  const COLOR_MAP = {
    [ProposalBadgeState.Created]: theme.palette.primary.light,
    [ProposalBadgeState.OpenForVoting]: theme.palette.success.main,
    [ProposalBadgeState.Passed]: theme.palette.success.main,
    [ProposalBadgeState.Executed]: theme.palette.success.main,
    [ProposalBadgeState.Cancelled]: theme.palette.error.main,
    [ProposalBadgeState.Expired]: theme.palette.error.main,
    [ProposalBadgeState.Failed]: theme.palette.error.main,
  };
  const color = COLOR_MAP[state] || '#000';
  return experimental_sx({
    ...theme.typography.subheader2,
    color,
    border: '1px solid',
    borderColor: alpha(color, 0.5),
    py: 0.5,
    px: 2,
    borderRadius: 1,
    display: 'inline-flex',
    alignItems: 'center',
  });
});

export function StateBadge({ state, loading }: StateBadgeProps) {
  if (loading || !state) return <Skeleton width={70} />;
  return <Badge state={state}>{state}</Badge>;
}

export const getProposalStates = () => {
  return Object.values(ProposalBadgeState);
};

export const stateToString = (stateToString: ProposalBadgeState) => {
  switch (stateToString) {
    case ProposalBadgeState.Created:
      return 'Created';
    case ProposalBadgeState.OpenForVoting:
      return 'Open for voting';
    case ProposalBadgeState.Passed:
      return 'Success';
    case ProposalBadgeState.Executed:
      return 'Executed';
    case ProposalBadgeState.Cancelled:
      return 'Cancelled';
    case ProposalBadgeState.Expired:
      return 'Expired';
    case ProposalBadgeState.Failed:
      return 'Failed';
  }
};

export const stringToState = (state: string) => {
  switch (state) {
    case 'Created':
      return ProposalBadgeState.Created;
    case 'Open for voting':
      return ProposalBadgeState.OpenForVoting;
    case 'Success':
      return ProposalBadgeState.Passed;
    case 'Executed':
      return ProposalBadgeState.Executed;
    case 'Cancelled':
      return ProposalBadgeState.Cancelled;
    case 'Expired':
      return ProposalBadgeState.Expired;
    case 'Failed':
      return ProposalBadgeState.Failed;
  }
};
