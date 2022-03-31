import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  state: ProposalState;
  executionTime: number;
  expirationTimestamp: number;
  executionTimeWithGracePeriod: number;
}

export function FormattedProposalTime({
  state,
  executionTime,
  expirationTimestamp,
  executionTimeWithGracePeriod,
}: FormattedProposalTimeProps) {
  const timestamp = useCurrentTimestamp(30);
  if ([ProposalState.Active, ProposalState.Pending].includes(state)) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>ends</Trans>
          &nbsp;
        </Typography>
        {dayjs.unix(expirationTimestamp).fromNow()}
      </Typography>
    );
  }
  if (
    [
      ProposalState.Canceled,
      ProposalState.Expired,
      ProposalState.Failed,
      ProposalState.Succeeded,
      ProposalState.Executed,
    ].includes(state)
  ) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>on</Trans>
          &nbsp;
        </Typography>
        {dayjs
          .unix(state === ProposalState.Executed ? executionTime : expirationTimestamp)
          .format('MMM DD, YYYY')}
      </Typography>
    );
  }
  const canBeExecuted = timestamp > executionTime;
  return (
    <Typography component="span" variant="caption">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'inline' } }}
      >
        {canBeExecuted ? <Trans>Expires</Trans> : <Trans>Can be executed</Trans>}
        &nbsp;
      </Typography>
      {dayjs.unix(canBeExecuted ? executionTimeWithGracePeriod : executionTime).fromNow()}
    </Typography>
  );
}
