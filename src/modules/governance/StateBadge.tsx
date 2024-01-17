import { ProposalV3State } from '@aave/contract-helpers';
import { alpha, experimental_sx, Skeleton, styled } from '@mui/material';

interface StateBadgeProps {
  state: ProposalV3State;
  loading?: boolean;
}

const Badge = styled('span')<StateBadgeProps>(({ theme, state }) => {
  const COLOR_MAP = {
    [ProposalV3State.Null]: theme.palette.secondary.main,
    [ProposalV3State.Created]: theme.palette.primary.light,
    [ProposalV3State.Active]: theme.palette.success.main,
    [ProposalV3State.Queued]: theme.palette.primary.light,
    [ProposalV3State.Executed]: theme.palette.success.main,
    [ProposalV3State.Cancelled]: theme.palette.error.main,
    [ProposalV3State.Expired]: theme.palette.error.main,
    [ProposalV3State.Failed]: theme.palette.error.main,
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
  if (loading) return <Skeleton width={70} />;
  return <Badge state={state}>{stateToString(state)}</Badge>;
}

// TODO: maybe move this to utils
const stateToString = (state: ProposalV3State) => {
  switch (state) {
    case ProposalV3State.Null:
      return 'Null';
    case ProposalV3State.Created:
      return 'Created';
    case ProposalV3State.Active:
      return 'Active';
    case ProposalV3State.Queued:
      return 'Queued';
    case ProposalV3State.Executed:
      return 'Executed';
    case ProposalV3State.Cancelled:
      return 'Cancelled';
    case ProposalV3State.Expired:
      return 'Expired';
    case ProposalV3State.Failed:
      return 'Failed';
  }
};
