import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  state: ProposalState;
  executionTime: number;
  expirationTimestamp: number;
}

function RelativeWord({ state }: { state: ProposalState }) {
  if ([ProposalState.Active, ProposalState.Pending].includes(state)) return <Trans>ends</Trans>;
  return <Trans>on</Trans>;
}

export function FormattedProposalTime({
  state,
  executionTime,
  expirationTimestamp,
}: FormattedProposalTimeProps) {
  return (
    <Typography component="span" variant="caption">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'inline' } }}
      >
        {state}&nbsp;
        <RelativeWord state={state} />
        &nbsp;
      </Typography>
      {[ProposalState.Active, ProposalState.Queued, ProposalState.Pending].includes(state) &&
        dayjs.unix(expirationTimestamp).fromNow()}
      {[
        ProposalState.Canceled,
        ProposalState.Expired,
        ProposalState.Failed,
        ProposalState.Succeeded,
      ].includes(state) && dayjs.unix(expirationTimestamp).format('MMM DD, YYYY')}
      {state === ProposalState.Executed && dayjs.unix(executionTime).format('MMM DD, YYYY')}
    </Typography>
  );
}
