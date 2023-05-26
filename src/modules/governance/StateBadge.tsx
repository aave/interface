import { ProposalState } from '@aave/contract-helpers';
import { alpha, experimental_sx, styled } from '@mui/material';

interface StateBadgeProps {
  state: ProposalState;
  loading?: boolean;
  crossChainBridge?: string;
  sx?: Record<string, unknown>;
  pendingL2Execution?: boolean;
}

const Badge = styled('span')<StateBadgeProps>(
  ({ theme, state, crossChainBridge, pendingL2Execution, ...rest }) => {
    const COLOR_MAP = {
      [ProposalState.Active]:
        crossChainBridge === 'L2' && state !== 'Active'
          ? theme.palette.info.main
          : theme.palette.secondary.main,
      [ProposalState.Queued]: theme.palette.info.main,
      [ProposalState.Pending]: '#2EBAC6',
      [ProposalState.Succeeded]: theme.palette.info.main,
      [ProposalState.Executed]: pendingL2Execution ? '#2EBAC6' : theme.palette.success.main,
      [ProposalState.Canceled]: theme.palette.primary.light,
      [ProposalState.Expired]: theme.palette.primary.light,
      [ProposalState.Failed]: theme.palette.primary.light,
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
  }
);

export function StateBadge({
  state,
  loading,
  pendingL2Execution,
  crossChainBridge,
  ...rest
}: StateBadgeProps) {
  // if (loading) return <Skeleton width={70} />;
  console.log('STATE', state, pendingL2Execution);

  const stateBadgeMap = {
    Pending: pendingL2Execution ? 'Pending' : 'New',
    Canceled: 'Canceled',
    Active: 'Voting active',
    Failed: 'Failed',
    Succeeded: 'Passed',
    Queued: 'Passed',
    Expired: 'Expired',
    Executed: pendingL2Execution && crossChainBridge === 'L2' ? 'Pending' : 'Executed',
  };

  return (
    <Badge
      state={state}
      crossChainBridge={crossChainBridge}
      pendingL2Execution={pendingL2Execution}
      {...rest}
    >
      {stateBadgeMap[state]}
    </Badge>
  );
}
