import { ProposalState } from '@aave/contract-helpers';
import { alpha, experimental_sx, Skeleton, styled } from '@mui/material';
// import { Trans } from '@lingui/macro';

interface StateBadgeProps {
  state: ProposalState;
  loading?: boolean;
  crossChainBridge?: string;
}

export const stateBadgeMap = {
  Pending: 'New',
  Canceled: 'Canceled',
  Active: 'Voting Active',
  Failed: 'Failed',
  Succeeded: 'Passed',
  Queued: 'Queued',
  Expired: 'Expired',
  Executed: 'Executed',
};

// export const stateBadgeMap = {
//   Pending: <Trans>New</Trans>,
//   Canceled: <Trans>Canceled</Trans>,
//   Active: <Trans>Voting Active</Trans>,
//   Failed: <Trans>Failed</Trans>,
//   Succeeded: <Trans>Passed</Trans>,
//   Queued: <Trans>Queued</Trans>,
//   Expired: <Trans>Expired</Trans>,
//   Executed: <Trans>Executed</Trans>,
// };

const Badge = styled('span')<StateBadgeProps>(({ theme, state, ...rest }) => {
  const COLOR_MAP = {
    [ProposalState.Active]: theme.palette.error.main,
    [ProposalState.Queued]: theme.palette.warning.main,
    [ProposalState.Pending]: theme.palette.warning.main,
    [ProposalState.Succeeded]: theme.palette.success.main,
    [ProposalState.Executed]: theme.palette.success.main,
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
});

export function StateBadge({ state, loading, crossChainBridge, ...rest }: StateBadgeProps) {
  if (loading) return <Skeleton width={70} />;
  return (
    <Badge state={state} {...rest}>
      {stateBadgeMap[state]} {crossChainBridge}
    </Badge>
  );
}
