import { ProposalState } from '@aave/contract-helpers';
import { alpha, experimental_sx, Skeleton, styled } from '@mui/material';

interface StateBadgeProps {
  state: ProposalState;
  loading?: boolean;
  crossChainBridge?: string;
}

const Badge = styled('span')<StateBadgeProps>(({ theme, state, crossChainBridge, ...rest }) => {
  const COLOR_MAP = {
    [ProposalState.Active]:
      crossChainBridge === 'L2' ? theme.palette.info.main : theme.palette.error.main,
    [ProposalState.Queued]: theme.palette.warning.main,
    [ProposalState.Pending]: theme.palette.warning.main,
    [ProposalState.Succeeded]: theme.palette.success.main,
    [ProposalState.Executed]: theme.palette.success.main,
    [ProposalState.Canceled]: theme.palette.primary.light,
    [ProposalState.Expired]: theme.palette.primary.light,
    [ProposalState.Failed]: theme.palette.error.main,
  };
  const color = COLOR_MAP[state] || '#000';
  return experimental_sx({
    ...rest,
    ...theme.typography.subheader2,
    color,
    border: '1px solid',
    borderColor: alpha(color, 0.5),
    py: 0.5,
    px: 2,
    borderRadius: 1,
    display: 'inline-flex',
    alignItems: 'center',
    '&:before': {
      content: '""',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      marginRight: '7px',
      display: 'inline-block',
      backgroundColor: color,
    },
  });
});

export function StateBadge({ state, loading, crossChainBridge, ...rest }: StateBadgeProps) {
  if (loading) return <Skeleton width={70} />;

  const stateBadgeMap = {
    Pending: crossChainBridge === 'L2' ? 'Pending' : 'New',
    Canceled: 'Canceled',
    Active: 'Voting Active',
    Failed: 'Failed',
    Succeeded: 'Passed',
    Queued: 'Queued',
    Expired: 'Expired',
    Executed: 'Executed',
  };

  return (
    <Badge state={state} crossChainBridge={crossChainBridge} {...rest}>
      {stateBadgeMap[state]}
    </Badge>
  );
}
